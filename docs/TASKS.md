# TASKS.md

Ordered build phases. Each phase should be completable and demoable before moving to the next. Do not skip ahead to later phases with unresolved items from earlier ones.

## Phase 0 — Project Setup
- [ ] Scaffold `backend/` (Express) and `frontend/` (React) as separate apps per ARCHITECTURE.md folder structure.
- [ ] Set up `.env` per API_SPEC.md §3, `.env.example` committed (no real secrets).
- [ ] Set up ESLint/Prettier per CODING_STANDARDS.md.
- [ ] Basic health-check route (`GET /api/health`).

## Phase 1 — GitHub Client
- [ ] Implement `github.service.js` using the server-side PAT (`GITHUB_PAT`).
- [ ] Fetch: repo metadata, language breakdown, file tree (recursive), README, rate-limit header parsing.
- [ ] Error mapping: repo not found → `REPO_NOT_FOUND`, rate limit → `RATE_LIMIT_EXCEEDED`.

## Phase 2 — Context Engine Core
- [ ] Implement `repositoryContext.js` factory matching the shape in CONTEXT_ENGINE.md §2.
- [ ] Implement `session.service.js` (in-memory `Map`, TTL eviction interval) per CONTEXT_ENGINE.md §5.
- [ ] Implement exclusion-list filtering (CONTEXT_ENGINE.md §4) as a shared utility used by all Context Builders.

## Phase 3 — Planning Agent
- [ ] Implement `planningAgent.js` — builds its context (README + manifests + tree + language stats only), calls the LLM gateway (`llm.service`), validates against `RepositoryAnalysisResult` schema.
- [ ] Wire `POST /api/repo/analyze` end to end (metadata fetch → context init → planning agent → response).

## Phase 4 — LLM Gateway (llm.service)
- [x] Implement `llm.service.js` as the sole module that communicates with OpenRouter.
- [ ] Implement internal agent-to-model routing configuration inside `llm.service` (not exposed to any other module or the frontend).
- [ ] Implement structured-output enforcement (JSON schema validation) + the retry policy (see DECISIONS.md).

## Phase 5 — Specialized Agents + Context Builders
- [ ] Context Builders: `codeReview`, `security`, `performance`, `architecture`, `documentation` per selection rules in CONTEXT_ENGINE.md §4.
- [ ] Agent modules for the same five, each producing its schema from AGENT_WORKFLOW.md §2.
- [ ] Unit tests per builder per CODING_STANDARDS.md §5.

## Phase 6 — Orchestrator + Result Aggregator
- [ ] Implement `orchestrator.js`: runs selected independent agents concurrently, holds Improvement Roadmap until dependencies complete, per AGENT_WORKFLOW.md §3.
- [ ] Implement `resultAggregator.js`: merges outputs, builds Improvement Roadmap's context input, per AGENT_WORKFLOW.md §2.7.
- [ ] Implement the Improvement Roadmap agent + context builder (no repo files, aggregator output only).
- [ ] Implement failure handling / single-retry policy per AGENT_WORKFLOW.md §4.

## Phase 7 — SSE Streaming Layer
- [ ] Implement `GET /api/repo/:sessionId/stream` per API_SPEC.md §2.4.
- [ ] Wire orchestrator event emission (`agent-start`, `agent-complete`, `agent-error`, `all-complete`).
- [ ] Implement `POST /api/repo/:sessionId/run-agents` and `GET /api/repo/:sessionId/report`.

## Phase 8 — Frontend Scaffold + URL Validation
- [ ] `UrlInput` component with client-side validation before any backend call (PROJECT_CONTEXT.md requirement).
- [ ] `api.js` service wrapping `/api/repo/validate` and `/api/repo/analyze`.
- [ ] `RepoSummaryCard` rendering the Planning Agent's summary.

## Phase 9 — Agent Selection UI
- [ ] `AgentSelection` component: recommendation checklist + token estimates, per UI_GUIDELINES.md §5.3.
- [ ] Wire to `run-agents` endpoint.

## Phase 10 — Streaming Progress + Report View
- [ ] `useAgentStream` hook wrapping `EventSource`.
- [ ] `AgentProgressPanel` component reflecting live states.
- [ ] `ReportView` tabbed component rendering each agent's schema, per UI_GUIDELINES.md §5.5 (including the mandatory Security disclaimer).

## Phase 11 — Export
- [ ] `export.service.js`: Markdown serialization of the report object.
- [ ] `export.service.js`: PDF rendering from the same data.
- [ ] `ExportBar` component + `POST /api/repo/:sessionId/export` wiring, including the expired-session error path.

## Phase 12 — Polish & Edge Cases
- [ ] Handle: repo too large (`REPO_TOO_LARGE`), GitHub rate limit exhausted, empty repo, repo with no README, user selecting only Improvement Roadmap (zero-other-agents edge case per AGENT_WORKFLOW.md §2.7).
- [ ] Session expiry mid-flow (during agent run, during export) — clear frontend messaging.
- [ ] Accessibility pass per UI_GUIDELINES.md §6.

## Phase 13 — Testing Pass
- [ ] Full unit test suite per CODING_STANDARDS.md §5.
- [ ] Integration smoke tests for every endpoint in API_SPEC.md.
- [ ] Manual end-to-end run against at least 3 real public repos of varying size/language before calling this done.

## Notes on Sequencing

- Do not start Phase 9+ (frontend interaction with agents) before Phase 6 (orchestrator) is working against at least a mocked `llm.service` — otherwise the frontend has nothing real to integrate against.
- The LLM gateway (Phase 4) should be working end-to-end against OpenRouter before Phases 5-7 are built out, so the rest of the pipeline can be developed and tested against a real, working gateway from the start.
