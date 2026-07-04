# AI_INSTRUCTIONS.md

This file is the entry point for any LLM/AI coding assistant building or extending **AI-GitHub-Code-Review-Agent**. Read this first, then follow the reading order below before writing any code.

## 1. Reading Order

1. `PROJECT_CONTEXT.md` — what this is, scope, constraints, success criteria.
2. `ARCHITECTURE.md` — system structure, folder layout, component responsibilities.
3. `AGENT_WORKFLOW.md` — the plan-then-execute flow and every agent's inputs/outputs/schema.
4. `CONTEXT_ENGINE.md` — the shared RepositoryContext object, context builders, session lifecycle, numeric limits.
5. `API_SPEC.md` — exact endpoints, request/response shapes, SSE events, env vars.
6. `UI_GUIDELINES.md` — visual/UX rules for the frontend.
7. `CODING_STANDARDS.md` — how code should be written and organized.
8. `TASKS.md` — the ordered build plan. Work through phases in order; do not jump ahead.
9. `DECISIONS.md` — the record of what's confirmed vs. assumed. Check this before treating any numeric limit or edge-case behavior as fixed.

## 2. Non-Negotiable Rules

- **Do not modify the architecture** described in `ARCHITECTURE.md` without first adding a dated entry to `DECISIONS.md` explaining why. This includes folder structure, the agent list, and the context-by-reference model.
- **Do not add authentication, user accounts, or a database.** These were explicitly ruled out (see `PROJECT_CONTEXT.md` §8, `DECISIONS.md` D-002/D-003). If a future request seems to imply one of these, flag it rather than silently adding it.
- **Do not send full raw repository content in any single LLM call.** Every agent's context must come from its Context Builder in `CONTEXT_ENGINE.md` §4, respecting the exclusion list and token budgets in §6.
- **Do not skip the Planning Agent.** It always runs first and is not user-selectable (see `AGENT_WORKFLOW.md` §2.1, `DECISIONS.md` D-007).
- **Do not run the Roadmap agent early.** It must wait for all other selected agents to reach a terminal state (see `AGENT_WORKFLOW.md` §2.7 and §3).
- **Do not invent new numeric limits or retry policies on the fly.** Use the defaults in `CONTEXT_ENGINE.md` §6 and `DECISIONS.md` D-009/D-011 unless a new decision entry overrides them.
- **Every agent's LLM response must be schema-validated** against the exact schema in `AGENT_WORKFLOW.md` §2 before being accepted, stored, or streamed to the client.
- **Every JSON schema and agent ID must match exactly** across all docs and all code (see `CODING_STANDARDS.md` §4 for the canonical ID list).

## 3. When Information Is Missing or Ambiguous

If you (the building LLM) hit a requirement that isn't covered by these 10 files, or find a conflict between two of them:

1. Check `DECISIONS.md` first — the gap may already be addressed as an ASSUMED decision you can proceed with.
2. If it's genuinely not covered, **do not silently assume and proceed** — surface the question to the project owner the same way this docs set itself was built (ask, get an answer, then add a new dated entry to `DECISIONS.md` before implementing).
3. Never resolve an ambiguity by quietly picking whichever option is easiest to code — resolve it by asking, exactly as this project's docs were produced.

## 4. Build Order

Follow `TASKS.md` phase by phase. Do not build frontend agent-interaction UI (Phase 9+) before the orchestrator (Phase 6) is functional against at least one working LLM provider. Do not add OpenAI/Gemini provider adapters before Claude is working end-to-end through the full pipeline once (see `TASKS.md`, "Notes on Sequencing").

## 5. Definition of Done (for the project as a whole)

A user can, without logging in or providing any credentials:
1. Paste a public GitHub URL and have it validated client-side.
2. See a repo summary and agent recommendations with token estimates.
3. Select agents and a provider, and watch results stream in per agent.
4. View a full tabbed report, including the mandatory Security disclaimer.
5. Export that report as PDF or as Markdown.

If any of these five steps doesn't work end-to-end against a real public repository, the build is not done — regardless of how much of `TASKS.md` is checked off.
