# API_SPEC.md

## 1. Conventions

- Base path: `/api`
- All responses: `application/json` except the SSE stream (`text/event-stream`) and the export endpoint (`application/pdf` or `text/markdown`).
- Standard error shape for all endpoints:
```json
{
  "error": {
    "code": "string (machine-readable, e.g. REPO_NOT_FOUND, RATE_LIMIT_EXCEEDED, VALIDATION_ERROR)",
    "message": "string (human-readable)",
    "details": "object | null"
  }
}
```
- No authentication headers on any endpoint — this app has no user accounts (see PROJECT_CONTEXT.md, DECISIONS.md).

## 2. Endpoints

### 2.1 `POST /api/repo/validate`

Optional server-side re-validation of a GitHub URL (frontend already does client-side validation first — see UI_GUIDELINES.md — this endpoint is a defensive backstop, not the primary gate).

**Request:**
```json
{ "repoUrl": "string" }
```
**Response 200:**
```json
{ "valid": true, "owner": "string", "repo": "string" }
```
**Response 400:**
```json
{ "error": { "code": "INVALID_URL", "message": "string" } }
```

---

### 2.2 `POST /api/repo/analyze`

Creates a session, fetches lightweight metadata, runs the Planning Agent (Repository Analysis).

**Request:**
```json
{ "repoUrl": "string" }
```
**Response 200:**
```json
{
  "sessionId": "string",
  "repoSummary": "RepositoryAnalysisResult (see AGENT_WORKFLOW.md §2.1)"
}
```
**Response 404:** repo not found (`REPO_NOT_FOUND`)
**Response 422:** repo too large / exceeds `MAX_REPO_SIZE_KB` (`REPO_TOO_LARGE`)
**Response 429:** GitHub rate limit exhausted even with server PAT (`RATE_LIMIT_EXCEEDED`)

---

### 2.3 `POST /api/repo/:sessionId/run-agents`

Kicks off the selected specialized agents.

**Request:**
```json
{
  "repoUrl": "https://github.com/expressjs/cors",
  "selectedAgents": ["codeReview", "security", "performance", "architecture", "documentation", "improvementRoadmap"]
}
```
**Response 202 (Accepted):**
```json
{ "sessionId": "string", "started": true, "streamUrl": "/api/repo/:sessionId/stream" }
```
**Response 404:** unknown/expired session (`SESSION_NOT_FOUND`)
**Response 400:** empty or invalid agent list (`VALIDATION_ERROR`)

---

### 2.4 `GET /api/repo/:sessionId/stream` (SSE)

Client opens this after calling `run-agents`. Emits events until `all-complete`.

**Event types:**

| Event | Payload |
|---|---|
| `agent-start` | `{ "agentId": "string" }` |
| `agent-complete` | `{ "agentId": "string", "result": "<agent-specific JSON, see AGENT_WORKFLOW.md>" }` |
| `agent-error` | `{ "agentId": "string", "error": { "code": "string", "message": "string" } }` |
| `all-complete` | `{ "sessionId": "string" }` |

SSE format example:
```
event: agent-complete
data: {"agentId":"security","result":{...}}

```

---

### 2.5 `GET /api/repo/:sessionId/report`

Returns the current aggregated report (can be called mid-run for partial results, or after `all-complete`).

**Response 200:**
```json
{
  "sessionId": "string",
  "repoSummary": "RepositoryAnalysisResult",
  "agentResults": {
    "codeReview": "CodeReviewResult | null",
    "security": "SecurityAssessmentResult | null",
    "performance": "PerformanceResult | null",
    "architecture": "ArchitectureResult | null",
    "documentation": "DocumentationResult | null",
    "improvementRoadmap": "ImprovementRoadmapResult | null"
  },
  "status": {
    "codeReview": "not_run | running | complete | error",
    "security": "not_run | running | complete | error",
    "performance": "not_run | running | complete | error",
    "architecture": "not_run | running | complete | error",
    "documentation": "not_run | running | complete | error",
    "improvementRoadmap": "not_run | running | complete | error"
  }
}
```

---

### 2.6 `POST /api/repo/:sessionId/export`

**Request:**
```json
{ "format": "pdf | markdown" }
```
**Response 200:** binary file stream, `Content-Disposition: attachment; filename="<repo>-review.<ext>"`
**Response 409:** nothing to export yet — no agents have completed (`NOTHING_TO_EXPORT`)

---

### 2.7 `DELETE /api/repo/:sessionId`

Manual session cleanup (in addition to automatic TTL eviction).

**Response 204:** no content

## 3. Environment Variables (`.env`)

```
PORT=3001
NODE_ENV=development

# GitHub — server-side PAT, no end-user GitHub auth anywhere in this app
GITHUB_PAT=

# LLM Gateway — only the backend holds this; frontend has no knowledge of it
OPENROUTER_API_KEY=

# Context engine limits (defaults documented in CONTEXT_ENGINE.md §6; overridable here)
SESSION_TTL_MINUTES=30
MAX_FILE_CONTENT_BYTES=51200
MAX_REPO_FILES_CONSIDERED=5000
MAX_REPO_SIZE_KB=512000
```

## 4. Notes

- No endpoint requires or accepts a user auth token — this is intentional (see PROJECT_CONTEXT.md §8, DECISIONS.md).
- `sessionId` is the only "credential" in this system, and it is not a secret — it just scopes a request to an in-memory context that will expire.
