# CODING_STANDARDS.md

## 1. General Principles

- Follow ARCHITECTURE.md's folder structure exactly. Do not introduce new top-level folders or restructure without adding an entry to DECISIONS.md first.
- Every new agent, provider, or context builder follows the existing pattern of its category (see ARCHITECTURE.md §2) rather than inventing a new pattern per feature.
- Prefer explicit, readable code over clever abstraction. This is a demo/portfolio project — clarity matters more than micro-optimization.

## 2. Backend (Node.js + Express)

- **Module style:** ES Modules (`import`/`export`), Node >= 18.
- **Async:** always `async/await`, never raw `.then()` chains in new code. Every `async` route/service function must be wrapped so rejected promises reach the centralized error handler (use an `asyncHandler` wrapper in `middleware/`).
- **Error handling:** a single `AppError` class (`{ statusCode, code, message, details }`) thrown from services/controllers; one centralized Express error-handling middleware (`middleware/errorHandler.js`) converts any error to the standard API error shape from API_SPEC.md §1. Never send raw stack traces to the client in production (`NODE_ENV=production`).
- **Controllers stay thin:** parse/validate input, call a service, return the response. Business logic lives in `services/`, `agents/`, `orchestrator/`, or `context/` — never in a controller.
- **Config:** all environment variables loaded once in `config/` via `dotenv`, exported as a typed/validated config object. No `process.env.X` reads scattered through the codebase — always go through `config`.
- **Logging:** a minimal structured logger (level + message + optional metadata object); no bare `console.log` in service/agent code (a `console.log` is fine only in top-level `server.js` startup banner).
- **LLM provider adapters:** each of `claudeProvider.js` / `openaiProvider.js` / `geminiProvider.js` implements the exact same exported function signature defined in `providerInterface.js`. The orchestrator must never branch on provider name outside the provider module itself.
- **Schema validation:** every agent's LLM response is validated against its JSON schema (AGENT_WORKFLOW.md §2) before being accepted; a validation failure triggers the retry policy (see DECISIONS.md), not a silent pass-through of malformed data.

## 3. Frontend (React)

- Functional components + hooks only, no class components.
- State management: React Context + `useReducer`/`useState` for session/report state (no Redux — scope doesn't warrant it; revisit only if a documented need arises, logged in DECISIONS.md).
- API calls isolated in `services/api.js` — components never call `fetch` directly.
- SSE handled through a single custom hook (`useAgentStream`) wrapping `EventSource`, exposing agent statuses/results to consuming components — no component opens its own `EventSource`.
- Styling: CSS variables per UI_GUIDELINES.md tokens; component-scoped CSS (CSS Modules or equivalent) — no inline style objects for anything beyond one-off dynamic values.

## 4. Naming Conventions

- Files: `camelCase.js` for backend modules, `PascalCase.jsx` for React components, `camelCase.js` for hooks/services/utils.
- Agent IDs are the canonical short strings used everywhere (backend, API, frontend): `planning`, `codeReview`, `security`, `performance`, `architecture`, `documentation`, `roadmap`. These exact strings must match across API_SPEC.md, AGENT_WORKFLOW.md, and all code — no aliasing.
- JSON schema names match AGENT_WORKFLOW.md exactly (`RepositoryAnalysisResult`, `CodeReviewResult`, `SecurityAssessmentResult`, `PerformanceResult`, `ArchitectureResult`, `DocumentationResult`, `RoadmapResult`).

## 5. Testing Expectations

- Unit tests (Jest) required for: each Context Builder (given a mock `RepositoryContext`, does it select the right files and stay under budget?), the Result Aggregator (does it merge correctly and pass the right subset to Roadmap?), and the exclusion/filtering logic in the Context Engine.
- At least one integration-style smoke test per API endpoint in API_SPEC.md (can mock the LLM provider calls).
- LLM provider adapters should be tested against a mocked HTTP layer, not live API calls, in CI.

## 6. Commit Conventions

- Conventional Commits style: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Reference the relevant TASKS.md item in the commit body when applicable (e.g. `Refs TASKS.md Phase 5`).

## 7. Documentation Discipline

- Any deviation from ARCHITECTURE.md, AGENT_WORKFLOW.md, or CONTEXT_ENGINE.md during implementation must be recorded as a new dated entry in DECISIONS.md at the time the deviation is made — not after the fact, not silently.
