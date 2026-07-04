# PROJECT_CONTEXT.md

## 1. What This Project Is

**AI-GitHub-Code-Review-Agent** is an agentic AI web application that reviews public GitHub repositories using a multi-agent workflow. A user submits a public GitHub repository URL; the system analyzes the repository, recommends which specialized analyses are worth running (with estimated token cost for each), lets the user pick which ones to run, executes the selected AI agents against a shared, reference-based repository context, streams results back progressively, and lets the user export the final report as PDF or Markdown.

This project exists to **demonstrate**, in a portfolio-quality build:
- Context engineering (shared context by reference, not raw duplication, across multiple agents)
- Tool orchestration (GitHub API + multiple LLM provider APIs coordinated by a backend orchestrator)
- Multi-agent workflow design (plan-then-execute, with dependent and independent agents)

## 2. Problem Statement

Manually reviewing an unfamiliar codebase for quality, security, performance, and architecture issues is slow and inconsistent. This app automates that first-pass review using specialized AI agents, each focused on one concern, so a developer gets a structured, multi-angle report in minutes instead of hours.

## 3. Target User

- Primary: the developer building this project, showcasing it as a portfolio/demo piece.
- Secondary (in-product persona): any developer who wants a fast, structured, multi-angle review of a public repository before contributing to it, adopting it, or auditing it.

## 4. Core User Flow (Summary)

1. User pastes a public GitHub repo URL into the frontend.
2. Frontend validates the URL format client-side before any backend call is made.
3. Backend fetches lightweight repo metadata and runs the **Repository Analysis** planning agent, which produces a repo summary and recommends which specialized agents are worth running, with an estimated token cost per agent.
4. User reviews recommendations and selects which agents to actually run (can accept recommendations as-is or override).
5. Backend builds a per-agent context (only what each agent needs) from the shared repository context and runs the selected agents.
6. Results stream back to the frontend progressively, per agent, as each completes.
7. User views the aggregated report in the UI.
8. User exports the report as PDF or Markdown.

## 5. The Seven Agents

1. **Repository Analysis** — mandatory first-pass planning agent. Always runs automatically; not user-selectable. Produces the repo summary and the recommendation set (with token estimates) for the other six.
2. **Code Review** — user-selectable
3. **Security Assessment** — user-selectable
4. **Performance Optimization** — user-selectable
5. **Architecture Evaluation** — user-selectable
6. **Documentation Generation** — user-selectable
7. **Improvement Roadmap Creation** — user-selectable; synthesizes the outputs of whichever other agents were run (see AGENT_WORKFLOW.md for dependency handling)

Each agent operates with its own specialized prompt and returns a structured JSON response (schema owned by that agent — see AGENT_WORKFLOW.md).

## 6. In Scope

- Public GitHub repositories only.
- No end-user authentication of any kind (anonymous, single-session use).
- No persistence — all data lives in memory for the duration of a session and is discarded after.
- Multi-LLM-provider support: Claude (Anthropic), OpenAI, and Google Gemini, user-selectable.
- Server-side GitHub Personal Access Token (PAT) for higher GitHub API rate limits — this is a backend credential, not a user login.
- Progressive, streamed results via Server-Sent Events (SSE).
- Export to PDF and Markdown.
- Clean, GitHub-inspired professional UI.

## 7. Explicitly Out of Scope

- Private repositories or any GitHub OAuth/user login flow.
- User accounts, saved history, or any database-backed persistence.
- Editing or modifying the target repository in any way (read-only analysis).
- CI/CD integration, webhooks, or automatic re-analysis on push.
- Any change to the agreed architecture without a corresponding entry in DECISIONS.md.

## 8. Constraints

- Backend: Node.js + Express.
- Frontend: React.
- No user authentication (JWT is not part of this application — see DECISIONS.md for the note on where that idea came from).
- No database — in-memory only.
- Must minimize token usage via context engineering: agents receive references (metadata, file paths, hashes, extracted summaries) and only the specific slices of content relevant to their task, not the whole repository dumped into every prompt.

## 9. Success Criteria

- A user can go from pasting a URL to a full, exported report without needing to log in or provide any credentials of their own.
- Token usage is visibly reduced by context engineering (per-agent context is a subset of the full shared context, not a full repo dump).
- The system degrades gracefully: a failure in one agent does not block the others or crash the session.
- The architecture is modular enough that a new agent (an 8th, 9th, etc.) can be added by implementing a new context builder + agent prompt + result schema, without touching unrelated agents.

## 10. Reading Order for This Docs Set

See `AI_INSTRUCTIONS.md` for the authoritative reading order and rules for the LLM that builds this application. In short: PROJECT_CONTEXT → ARCHITECTURE → AGENT_WORKFLOW → CONTEXT_ENGINE → API_SPEC → UI_GUIDELINES → CODING_STANDARDS → TASKS → DECISIONS → AI_INSTRUCTIONS (as a final rules-recap before writing code).
