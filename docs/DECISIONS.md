# DECISIONS.md

Architecture Decision Record log. Every decision below is either **CONFIRMED** (explicitly stated by the project owner) or **ASSUMED** (a default I chose to keep the spec complete and buildable — flagged for review, not treated as final). Any future deviation from these while building must be added here as a new dated entry, per CODING_STANDARDS.md §7.

---

### D-001 — LLM Provider Strategy
**Status:** CONFIRMED
**Decision:** Multi-provider — Claude (Anthropic), OpenAI, and Google Gemini — user-selectable at run time.
**Note:** Provider choice is a single selection applied to the whole run (all agents in that run use the same provider), not per-agent. Per-agent provider mixing was not requested; if wanted later, add as a new task in TASKS.md and a new decision here.

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

### D-008 — Roadmap Agent Dependency Ordering
**Status:** ASSUMED — please confirm
**Decision:** Improvement Roadmap Creation runs last, after all other selected agents complete, using their aggregated outputs as its only input (no raw repo files).
**Why flagged:** Not explicitly stated, but implied by "Improvement Roadmap Creation" being a synthesis-style deliverable. Edge case also assumed: if a user selects only Roadmap and nothing else, Roadmap falls back to using the Planning Agent's summary as minimal input rather than failing outright.

### D-009 — Numeric Defaults (session TTL, file size caps, token budgets)
**Status:** ASSUMED — please confirm or override
**Decision:** See CONTEXT_ENGINE.md §6 for the full table (session TTL 30 min, max file content 50 KB, max repo size 500 MB, per-agent token budgets 4k-12k). These are standard, conservative engineering defaults, not requirements gathered from the project owner.

### D-010 — Single Provider Per Run (not per agent)
**Status:** ASSUMED — please confirm
**Decision:** The user picks one LLM provider for the whole run rather than mixing providers per agent. Simpler to build and reason about first; per-agent provider selection can be added later without breaking the architecture (the provider abstraction already supports it).

### D-011 — Retry Policy for Failed Agent Calls
**Status:** ASSUMED — please confirm
**Decision:** One automatic retry (same provider) on schema-validation failure or transient error before marking an agent as errored in the UI. No exponential backoff beyond a single retry, to keep the demo responsive.

### D-012 — Security Agent Disclaimer Requirement
**Status:** ASSUMED, but treated as a hard requirement going forward
**Decision:** The Security Assessment agent's output must always include a visible disclaimer that this is a heuristic/LLM-based review, not a certified security scan. This isn't optional polish — it's there to avoid the report being mistaken for a real SAST/vulnerability audit.

### D-013 — Single-Instance Deployment Assumption
**Status:** ASSUMED — please confirm
**Decision:** The in-memory session store assumes a single backend process/instance. No shared cache (e.g. Redis) is included, since that would reintroduce external infrastructure the "no database" decision was meant to avoid. If horizontal scaling is needed later, this needs a follow-up decision (likely a shared in-memory store like Redis used purely as a cache, not a database — would need explicit sign-off since it changes the "no external persistence" constraint).

---

## How to Use This File

- Before implementing anything that touches an ASSUMED decision above, either confirm it's fine as-is or override it here with a new entry, dated, explaining the change and its downstream impact on ARCHITECTURE.md / AGENT_WORKFLOW.md / CONTEXT_ENGINE.md / API_SPEC.md as applicable.
- CONFIRMED decisions are not to be silently changed during implementation — if one turns out to be wrong or impractical, raise it explicitly rather than quietly deviating.
