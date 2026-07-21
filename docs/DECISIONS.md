# DECISIONS.md

Architecture Decision Record log. Every decision below is either **CONFIRMED** (explicitly stated by the project owner) or **ASSUMED** (a default I chose to keep the spec complete and buildable — flagged for review, not treated as final). Any future deviation from these while building must be added here as a new dated entry, per CODING_STANDARDS.md §7.

---

### D-001 — LLM Provider Strategy
**Status:** SUPERSEDED by D-014
**Decision (original):** Multi-provider — Claude (Anthropic), OpenAI, and Google Gemini — user-selectable at run time.
**Note:** Provider choice was a single selection applied to the whole run (all agents in that run use the same provider), not per-agent.
**Superseded because:** the project moved to a single backend-owned LLM gateway (OpenRouter) with no user-facing provider selection at all — see D-014.

### D-002 — User Authentication
**Status:** CONFIRMED
**Decision:** No user accounts. Anonymous, single-session use only.
**Note:** A JWT authentication mention appeared in an earlier, unrelated conversation about the project owner's résumé skills section — that referred to a different/past project context, not this application. This app has zero authentication surface for end users.

### D-003 — Persistence Layer
**Status:** CONFIRMED
**Decision:** No database. In-memory only; all session data is discarded when the session is evicted or the server restarts.
**Implication:** Export (PDF/Markdown) must happen within the session's active window — see D-005.

### D-004 — GitHub Rate Limit Handling
**Status:** CONFIRMED
**Decision:** Single server-side GitHub PAT stored as an environment variable, used for all GitHub API calls. Still no end-user GitHub login of any kind.

### D-005 — Streaming Mechanism
**Status:** CONFIRMED (recommended by Claude, accepted by project owner)
**Decision:** Server-Sent Events (SSE), not WebSockets or polling.
**Rationale:** Data flow is one-directional (server → client) for agent progress; SSE gives true progressive streaming without the bidirectional overhead of WebSockets or the latency/inefficiency of polling.

### D-006 — Agent Set
**Status:** CONFIRMED
**Decision:** Seven agents total: Repository Analysis, Code Review, Security Assessment, Performance Optimization, Architecture Evaluation, Documentation Generation, Improvement Roadmap Creation. Each has a specialized prompt and a structured JSON response schema.

### D-007 — Repository Analysis as Mandatory Planning Step
**Status:** ASSUMED — please confirm
**Decision:** Interpreted "Repository Analysis" as the mandatory, always-runs-first planning agent (matches the original requirement that the app "plans before execution, analyzing the repository first"), and the other six as the user-selectable specialized set.
**Why flagged:** The seven agents were listed as a flat list without specifying which one is the planning step. This interpretation was the most consistent one with the earlier stated requirement ("analyzing the repository first and then executing specialized analysis agents") and with there needing to be a recommendation-generating step before user selection. If Repository Analysis was instead meant to be a user-selectable seventh option (with some other mechanism generating recommendations), this needs correcting.

### D-008 — Improvement Roadmap Agent Dependency Ordering
**Status:** ASSUMED — please confirm
**Decision:** Improvement Roadmap Creation runs last, after all other selected agents complete, using their aggregated outputs as its only input (no raw repo files).
**Why flagged:** Not explicitly stated, but implied by "Improvement Roadmap Creation" being a synthesis-style deliverable. Edge case also assumed: if a user selects only Improvement Roadmap and nothing else, Improvement Roadmap falls back to using the Planning Agent's summary as minimal input rather than failing outright.

### D-009 — Numeric Defaults (session TTL, file size caps, token budgets)
**Status:** ASSUMED — please confirm or override
**Decision:** See CONTEXT_ENGINE.md §6 for the full table (session TTL 30 min, max file content 50 KB, max repo size 500 MB, per-agent token budgets 4k-12k). These are standard, conservative engineering defaults, not requirements gathered from the project owner.

### D-010 — Single Provider Per Run (not per agent)
**Status:** SUPERSEDED by D-014
**Decision (original):** The user picks one LLM provider for the whole run rather than mixing providers per agent.
**Superseded because:** there is no longer any user-facing provider concept at all. The spirit of this decision survives in a different form — different agents *can* use different models internally — but it's now a backend routing detail owned by `llm.service`, not a user choice. See D-014.

### D-011 — Retry Policy for Failed Agent Calls
**Status:** ASSUMED — please confirm
**Decision:** One automatic retry (via `llm.service`) on schema-validation failure or transient error before marking an agent as errored in the UI. No exponential backoff beyond a single retry, to keep the demo responsive.

### D-012 — Security Agent Disclaimer Requirement
**Status:** ASSUMED, but treated as a hard requirement going forward
**Decision:** The Security Assessment agent's output must always include a visible disclaimer that this is a heuristic/LLM-based review, not a certified security scan. This isn't optional polish — it's there to avoid the report being mistaken for a real SAST/vulnerability audit.

### D-013 — Single-Instance Deployment Assumption
**Status:** ASSUMED — please confirm
**Decision:** The in-memory session store assumes a single backend process/instance. No shared cache (e.g. Redis) is included, since that would reintroduce external infrastructure the "no database" decision was meant to avoid. If horizontal scaling is needed later, this needs a follow-up decision (likely a shared in-memory store like Redis used purely as a cache, not a database — would need explicit sign-off since it changes the "no external persistence" constraint).

### D-014 — Single LLM Gateway via OpenRouter (supersedes D-001, D-010)
**Status:** CONFIRMED
**Decision:** The application no longer supports multiple, user-selectable LLM providers. All AI communication now goes through a single backend module, `llm.service`, which is the only part of the codebase that talks to OpenRouter. The call chain is always `Agent → llm.service → OpenRouter → configured AI model`.
**What was removed:** the Claude/OpenAI/Gemini provider adapters, the shared `providerInterface.js` multi-provider contract, provider selection in the API and UI, model selection by users, and any notion of user-provided API keys or frontend-side key management (including localStorage-based key handling, which was never implemented but is explicitly ruled out going forward).
**What replaced it:** different agents may still be routed to different underlying models (e.g. a fast model for Planning, a higher-reasoning model for Security/Architecture, a cost-efficient model for Documentation), but this mapping is internal backend configuration owned entirely by `llm.service`. It is not exposed to the frontend, not user-selectable, and specific model names are treated as an implementation detail rather than something the rest of the architecture, docs, or code should depend on.
**Vendor-agnostic documentation rule:** the rest of the documentation set should describe this layer as "the LLM gateway" or "`llm.service`" rather than naming OpenRouter repeatedly — OpenRouter is mentioned specifically only where the LLM communication layer itself is being discussed (this file and ARCHITECTURE.md §8).
**Unaffected by this decision:** the user-facing workflow (URL entry → validation → metadata fetch → Planning Agent → summary → agent selection → execution → streaming → export), the RepositoryContext/Context Engine, the Agent Orchestrator, the Result Aggregator, session management, and export all remain exactly as previously documented.

---

## How to Use This File

- Before implementing anything that touches an ASSUMED decision above, either confirm it's fine as-is or override it here with a new entry, dated, explaining the change and its downstream impact on ARCHITECTURE.md / AGENT_WORKFLOW.md / CONTEXT_ENGINE.md / API_SPEC.md as applicable.
- CONFIRMED decisions are not to be silently changed during implementation — if one turns out to be wrong or impractical, raise it explicitly rather than quietly deviating.
