# ARCHITECTURE.md

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            React Frontend                        │
│  URL Input+Validate → Recommendation Screen → Streaming Progress  │
│                    → Report View → Export (PDF/MD)                │
└───────────────────────────────┬───────────────────────────────────┘
                                 │ REST + SSE
┌───────────────────────────────▼───────────────────────────────────┐
│                        Express Backend (Node.js)                  │
│                                                                     │
│  Routes/Controllers                                                │
│   ├─ /api/repo/validate                                            │
│   ├─ /api/repo/analyze          (Planning Agent trigger)           │
│   ├─ /api/repo/:id/run-agents   (execute selected agents)          │
│   ├─ /api/repo/:id/stream       (SSE)                              │
│   ├─ /api/repo/:id/report       (final aggregated JSON)            │
│   └─ /api/repo/:id/export       (PDF/Markdown)                     │
│                                                                     │
│  ┌───────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │
│  │ GitHub Client │  │  Context Engine  │  │  Agent Orchestrator  │ │
│  │ (server PAT)  │─▶│ RepositoryContext│─▶│  (plan-then-execute) │ │
│  └───────────────┘  │  Session Store   │  └──────────┬───────────┘ │
│                      └──────────────────┘             │             │
│                                                        ▼             │
│                                        ┌───────────────────────────┐│
│                                        │   7 Agent Modules          ││
│                                        │  (each: context builder +  ││
│                                        │   prompt + LLM call +      ││
│                                        │   result validator)        ││
│                                        └──────────────┬─────────────┘│
│                                                        ▼             │
│                                        ┌───────────────────────────┐│
│                                        │   Result Aggregator         ││
│                                        └──────────────┬─────────────┘│
│                                                        ▼             │
│                                        ┌───────────────────────────┐│
│                                        │      llm.service            ││
│                                        │   (LLM Gateway via Puter)   ││
│                                        └───────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Backend Structure

```
backend/
├── src/
│   ├── config/            # env loading, constants (TTLs, limits)
│   ├── routes/            # Express route definitions
│   ├── controllers/       # request handling, thin — delegate to services
│   ├── services/
│   │   ├── github.service.js         # GitHub REST client (server PAT)
│   │   ├── session.service.js        # in-memory session store (RepositoryContext)
│   │   ├── export.service.js         # PDF/Markdown generation
│   │   └── llm.service.js            # single LLM gateway — the only module that talks to Puter
│   ├── context/
│   │   ├── repositoryContext.js      # shape + factory for shared context object
│   │   └── contextBuilders/          # one file per agent, builds agent-specific slice
│   ├── agents/
│   │   ├── planningAgent.js          # Repository Analysis (always runs first)
│   │   ├── codeReviewAgent.js
│   │   ├── securityAgent.js
│   │   ├── performanceAgent.js
│   │   ├── architectureAgent.js
│   │   ├── documentationAgent.js
│   │   └── roadmapAgent.js           # depends on other agents' outputs
│   ├── orchestrator/
│   │   ├── orchestrator.js           # sequencing, dependency handling, SSE emission
│   │   └── resultAggregator.js       # merges structured agent outputs into one report
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateRepoUrl.js
│   ├── utils/
│   └── app.js / server.js
└── .env
```

## 3. Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UrlInput/
│   │   ├── RepoSummaryCard/
│   │   ├── AgentSelection/            # checklist + token estimates
│   │   ├── AgentProgressPanel/        # per-agent status, streamed
│   │   ├── ReportView/                # tabbed, markdown-rendered
│   │   └── ExportBar/
│   ├── hooks/
│   │   ├── useRepoUrlValidation.js
│   │   └── useAgentStream.js          # wraps EventSource (SSE)
│   ├── context/                       # React state context (session id, report state)
│   ├── services/
│   │   └── api.js                     # fetch wrappers for backend REST endpoints
│   ├── utils/
│   └── App.jsx
```

## 4. Shared Repository Context (Reference-Based)

The **RepositoryContext** is the single source of truth per analysis session. It is built once (during the Planning Agent step) and reused by every subsequent agent. It stores **references**, not full raw content:

- Repository metadata (owner, name, description, stars, forks, license, primary language, language breakdown, size, default branch, topics)
- Full file tree (paths only)
- Per-file metadata: path, size, SHA/hash, language
- Extracted summaries (short, generated once, reused by any agent that needs a high-level view instead of raw code)
- A small bounded raw-file cache: only actual file **contents** that have been fetched so far, keyed by path, evicted on session cleanup

No agent receives the entire repository's raw content in its prompt. See CONTEXT_ENGINE.md for the exact object shape and per-agent context-building rules.

## 5. Session Store

- In-memory `Map<sessionId, RepositoryContext>` on the backend process.
- No database (per project decision — see DECISIONS.md).
- Session TTL and cleanup interval: see CONTEXT_ENGINE.md §5 (Session Lifecycle).
- This means: no horizontal scaling across multiple backend instances without a shared cache (out of scope for this project; single-instance deployment assumed).

## 6. Agent Orchestrator

Responsibilities:
- Runs the Planning Agent (Repository Analysis) first, always, unconditionally.
- Accepts the user's selected agent list.
- Runs independent agents (Code Review, Security, Performance, Architecture, Documentation) with as much concurrency as the LLM gateway and rate limits allow.
- Holds back the Improvement Roadmap Creation agent until all other selected agents have completed (it depends on their outputs — see AGENT_WORKFLOW.md).
- Emits SSE events at each state transition (agent-start, agent-complete, agent-error, all-complete).
- On an individual agent failure: emits `agent-error` for that agent only, continues the rest of the run, does not fail the whole session.

## 7. Result Aggregator

- Collects each agent's structured JSON output (validated against that agent's schema).
- Merges them into a single report object keyed by agent id.
- Feeds the merged (non-roadmap) outputs into the Roadmap agent's context builder when Roadmap is selected.
- Produces the final report object consumed by both the Report View (UI) and the Export service.

## 8. LLM Gateway (llm.service)

- The application uses a single LLM gateway, implemented via Puter. `llm.service.js` is the **only** module in the entire codebase that communicates with Puter — no agent, controller, or route ever calls it directly.
- The call chain is always: `Agent → llm.service → Puter → configured AI model`.
- `llm.service` exposes one common function to agents: given a prompt + expected JSON schema + options, return a parsed, validated structured result. Agents don't know or care which model answered.
- Different agents may be routed to different underlying models (e.g. a fast model for the Planning Agent, a higher-reasoning model for Security or Architecture, a cost-efficient model for Documentation). This agent-to-model mapping is owned entirely by `llm.service` as internal backend configuration — it is not exposed to the frontend, not user-selectable, and specific model names are treated as an implementation detail rather than something the rest of the architecture depends on.
- There is no provider selection, no user-provided API keys, and no per-run provider choice anywhere in the system — see DECISIONS.md.

## 9. GitHub Client

- Single server-side GitHub PAT (env var `GITHUB_PAT`), used for all GitHub REST calls.
- No end-user GitHub authentication anywhere in this system.
- Basic rate-limit awareness: reads `X-RateLimit-Remaining`/`X-RateLimit-Reset` headers, backs off / surfaces a clear error if exhausted.

## 10. Streaming Layer (SSE)

- One SSE connection per session: `GET /api/repo/:sessionId/stream`.
- The orchestrator pushes events onto this stream as agents progress.
- Chosen over WebSockets because the data flow is one-directional (server → client); chosen over polling because it gives true progressive results without client-side interval overhead. See DECISIONS.md.

## 11. Export Module

- Runs after the session's report is complete (or partially complete — partial export of finished agents is allowed).
- Two formats: Markdown (direct serialization of the report object) and PDF (rendered from the same Markdown/report data).
- Since there's no persistence, export must happen within the active session's TTL window.

## 12. What This Architecture Explicitly Avoids

- No raw full-repository content is ever sent in a single LLM call.
- No agent has hidden/implicit access to another agent's raw context — anything the Roadmap agent needs from other agents comes through the Result Aggregator, explicitly.
- No user data is written to disk or a database.
