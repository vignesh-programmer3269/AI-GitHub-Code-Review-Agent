# CONTEXT_ENGINE.md

## 1. Purpose

The Context Engine is the layer that builds and manages the **RepositoryContext** (shared, per-session, in-memory) and produces **per-agent context slices** from it. Its job is to minimize token usage by ensuring no agent ever receives more than it needs, and no data is duplicated across agents beyond what's necessary.

## 2. RepositoryContext Shape

```js
RepositoryContext = {
  sessionId: "string (uuid)",
  repoUrl: "string",
  owner: "string",
  repo: "string",
  defaultBranch: "string",

  metadata: {
    description: "string",
    stars: "number",
    forks: "number",
    license: "string | null",
    topics: ["string"],
    sizeKb: "number",
    languages: [{ "language": "string", "bytes": "number", "percentage": "number" }],
    createdAt: "string (ISO date, repo creation)",
    lastPushAt: "string (ISO date, repo last push)"
  },

  fileTree: [
    { "path": "string", "type": "file | dir", "sizeBytes": "number | null" }
  ],

  fileHashes: {
    // path -> git blob SHA, used for cache-key/change-detection purposes
    "<path>": "<sha>"
  },

  fileSummaries: {
    // path -> short generated summary (1-3 sentences), populated lazily as agents touch files
    "<path>": "<summary text>"
  },

  rawFileCache: {
    // path -> raw file content, bounded LRU, only populated for files actually fetched
    "<path>": "<content, truncated to MAX_FILE_CONTENT_BYTES if needed>"
  },

  readme: "string | null (raw README content, fetched once, reused by any agent)",

  planningResult: "RepositoryAnalysisResult | null (cached once Planning Agent runs)",

  createdAt: "timestamp",
  lastAccessedAt: "timestamp"
}
```

## 3. Why References, Not Raw Dumps

- `fileTree` and `fileHashes` are cheap (path/metadata only) and safe to keep in full for the whole repo.
- `rawFileCache` and `fileSummaries` are populated **on demand**, only for files a Context Builder actually decided are relevant to a specific agent — never the whole repo at once.
- Every agent's prompt is built from a **subset** of `RepositoryContext`, assembled by that agent's Context Builder, not from the object as a whole.

## 4. Context Builders (one per agent)

Each Context Builder is a pure function: `(RepositoryContext, tokenBudget) → { promptContext, filesUsed }`.

Common rules across all builders:
- **Exclusion list** (applied before any file is considered for any agent): `.git/`, `node_modules/`, `dist/`, `build/`, `vendor/`, `coverage/`, `.next/`, `__pycache__/`, common binary/media extensions (images, fonts, archives, compiled binaries), and lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) — lock files are excluded from raw content but still counted in metadata.
- **Per-file size cap:** files larger than `MAX_FILE_CONTENT_BYTES` (default 50 KB — see §6 for defaults) are truncated with a note appended (`"...[truncated]"`) rather than skipped outright, unless a smaller representative slice makes more sense (builder's discretion, documented per agent below).
- **Token budget:** each builder receives a max input token budget for its agent (see §6) and must select files until that budget would be exceeded, prioritizing by the rule below, then stop.

Per-agent file-selection priority:

| Agent | Selection priority |
|---|---|
| Repository Analysis (Planning) | README + manifest files + file tree + language stats only. No arbitrary source file content. |
| Code Review | Largest non-generated source files first, up to budget. If an import graph is derivable cheaply (e.g. from a manifest's entry point), prioritize files closer to entry points instead. |
| Security | Files matching security-sensitive path/name patterns (`auth`, `config`, `env`, `secret`, `login`, `db`, `database`, `middleware`) first, then dependency manifests, then general source files if budget remains. |
| Performance | Files containing loop/DB-call/network-call heuristics (simple keyword/regex pass, e.g. presence of `for`, `while`, `SELECT`, `fetch(`, `.map(` at high density) prioritized, plus dependency manifest for heavy-package detection. |
| Architecture | Full file tree + directory-level `fileSummaries` (generated cheaply, one pass) prioritized over raw file content; only a handful of structurally representative files (entry points, route/controller layers) get raw content. |
| Documentation | README (full), any `docs/` directory contents, and a small sample of source files purely to gauge comment/docstring density (not full review). |
| Improvement Roadmap | No repository files at all — built exclusively from the Result Aggregator's merged JSON output of other completed agents (see AGENT_WORKFLOW.md §2.7). |

## 5. Session Lifecycle

- Sessions live in an in-memory `Map<sessionId, RepositoryContext>` inside the single backend process (no database — see DECISIONS.md).
- `lastAccessedAt` is updated on every read/write to the session.
- A background interval (default every 5 minutes) evicts sessions idle longer than `SESSION_TTL_MINUTES` (default 30 minutes — see §6).
- Manual cleanup is available via `DELETE /api/repo/:sessionId` (see API_SPEC.md).
- Because there is no persistence, **export must happen before the session is evicted** — the UI should surface remaining session time or at least warn on evident staleness (see UI_GUIDELINES.md).

## 6. Default Numeric Limits (assumed — see DECISIONS.md)

These were not specified in requirements gathering and are treated as adjustable defaults, not fixed requirements:

| Setting | Default | Notes |
|---|---|---|
| `SESSION_TTL_MINUTES` | 30 | Idle session eviction window |
| `MAX_FILE_CONTENT_BYTES` | 51200 (50 KB) | Per-file raw content cap before truncation |
| `MAX_REPO_FILES_CONSIDERED` | 5000 | Repos with more files (after exclusions) are still summarized at tree level but raw content fetching is capped |
| `MAX_REPO_SIZE_KB` | 512000 (500 MB) | Repos larger than this are rejected at Step 2 with a clear error |
| Token budget — Planning | 4,000 input tokens | Metadata + README + manifests only |
| Token budget — Code Review / Security / Performance / Architecture / Documentation | 12,000 input tokens each (default) | Adjustable per the model `llm.service` assigns to that agent internally |
| Token budget — Improvement Roadmap | 6,000 input tokens | Built from other agents' JSON outputs, which are already compact |

## 7. File Summaries (Lazy Generation)

- `fileSummaries` are not pre-generated for the whole repo up front (that would defeat the purpose of context engineering).
- They are generated the first time any Context Builder decides a file is relevant but doesn't need full raw content (e.g. Architecture agent wanting a directory overview) — generated once, cached in `RepositoryContext.fileSummaries`, reused by any later agent in the same session that touches the same file.
