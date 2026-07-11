# AGENT_WORKFLOW.md

## 1. Overall Flow (Plan-Then-Execute)

```
Step 1  Frontend: client-side URL validation (regex + basic reachability shape check)
Step 2  Backend: POST /api/repo/analyze
          → create session, fetch lightweight repo metadata via GitHub client
          → build initial RepositoryContext (metadata, file tree, hashes — no full file contents yet)
          → run Repository Analysis (Planning) agent
          → return: sessionId, repo summary, recommended agents + token estimate per agent
Step 3  Frontend: show recommendations to user (checklist, pre-checked per recommendation,
          token estimate shown per agent, user can toggle any agent on/off)
Step 4  Backend: orchestrator parses `selectedAgents` and spins up independent agent flows concurrently
Step 5  Backend: for each selected non-Improvement Roadmap agent, build agent-specific context (Context Builder)
Step 6  Backend: route context to configured model via `llm.service`, validate JSON output, write to session
Step 7  Backend: once all non-Improvement Roadmap selected agents are done, if Improvement Roadmap was selected, aggregator merges outputs to build context for Improvement Roadmap agent
Step 8  Backend: Result Aggregator finalizes the full report object; emits all-complete
Step 9  Frontend: renders the report progressively as events arrive, then the completed view
Step 10 Frontend: user triggers export (PDF or Markdown) via /api/repo/:sessionId/export
```

## 2. Agent Specifications

### 2.1 Repository Analysis (Planning Agent) — always runs, not user-selectable

- **Purpose:** Understand the repository at a high level before spending tokens on deep analysis. Produces the repo summary shown to the user and recommends which of the 6 specialized agents are worth running, with an estimated token cost for each.
- **Inputs:** repo metadata (language stats, size, topics, description), file tree, README content, manifest files (e.g. `package.json`, `requirements.txt`, `pom.xml` — whichever exist), directory structure shape. No full source files.
- **Output JSON schema (`RepositoryAnalysisResult`):**

```json
{
  "summary": "string — 2-4 sentence plain-language summary of what the repo is",
  "primaryLanguage": "string",
  "languageBreakdown": [{ "language": "string", "percentage": "number" }],
  "estimatedComplexity": "low | medium | high",
  "detectedStack": ["string"],
  "recommendations": [
    {
      "agentId": "codeReview | security | performance | architecture | documentation | improvementRoadmap",
      "recommended": "boolean",
      "reason": "string",
      "estimatedTokens": "number"
    }
  ]
}
```

- **Dependency:** none — runs first, always.

### 2.2 Code Review — user-selectable

- **Purpose:** Line/function/module-level code quality review — readability, correctness risk, code smells, style consistency.
- **Inputs:** raw content of a bounded, representative sample of source files (see CONTEXT_ENGINE.md for file selection strategy — prioritizes largest/most-central files by import graph proximity when derivable, otherwise largest non-generated source files up to the token budget).
- **Output JSON schema (`CodeReviewResult`):**

```json
{
  "overallRating": "1-10 number",
  "findings": [
    {
      "file": "string (path)",
      "line": "number | null",
      "severity": "info | minor | major",
      "issue": "string",
      "suggestion": "string"
    }
  ],
  "strengths": ["string"]
}
```

- **Dependency:** none.

### 2.3 Security Assessment — user-selectable

- **Purpose:** Identify likely security issues — hardcoded secrets patterns, unsafe dependency patterns, injection risk patterns, insecure defaults — at a static/heuristic + LLM-reasoning level. **Not** a substitute for a real SAST/dependency-vulnerability scanner; the report must say so explicitly (see UI_GUIDELINES.md disclaimer requirement).
- **Inputs:** raw content of files matching security-sensitive patterns (auth, config, env handling, network/database access, dependency manifests), plus manifest files for known-risky dependency names.
- **Output JSON schema (`SecurityAssessmentResult`):**

```json
{
  "riskLevel": "low | medium | high",
  "findings": [
    {
      "file": "string",
      "line": "number | null",
      "category": "secrets | dependency | injection | auth | config | other",
      "severity": "info | minor | major | critical",
      "issue": "string",
      "recommendation": "string"
    }
  ],
  "disclaimer": "string — always populated, states this is heuristic/LLM-based, not a certified scan"
}
```

- **Dependency:** none.

### 2.4 Performance Optimization — user-selectable

- **Purpose:** Flag likely performance issues — inefficient loops/queries, missing memoization/caching opportunities, obvious N+1 patterns, bundle-size concerns for frontend repos.
- **Inputs:** raw content of files identified as "hot path" candidates (entry points, files with loops/DB calls detected via lightweight static heuristics), plus dependency manifest for known heavy packages.
- **Output JSON schema (`PerformanceResult`):**

```json
{
  "findings": [
    {
      "file": "string",
      "line": "number | null",
      "issue": "string",
      "impact": "low | medium | high",
      "suggestion": "string"
    }
  ],
  "generalNotes": ["string"]
}
```

- **Dependency:** none.

### 2.5 Architecture Evaluation — user-selectable

- **Purpose:** Assess overall structure — module boundaries, separation of concerns, folder/layer organization, coupling.
- **Inputs:** file tree (full), directory-level summaries (not full raw content of every file — mostly structural), a small sample of raw content from files that best represent architectural boundaries (e.g. entry points, route/controller layers, top-level index files).
- **Output JSON schema (`ArchitectureResult`):**

```json
{
  "architectureStyle": "string (best-guess label, e.g. 'layered MVC', 'monorepo microservices', etc.)",
  "strengths": ["string"],
  "concerns": ["string"],
  "moduleBoundaryNotes": "string",
  "diagramDescription": "string — plain-text description of the structure suitable for rendering"
}
```

- **Dependency:** none.

### 2.6 Documentation Generation — user-selectable

- **Purpose:** Evaluate existing documentation quality (README, inline comments, docstrings) and generate suggested improvements or missing sections.
- **Inputs:** README content, any `docs/` content, a sample of source files' existing comment/docstring density.
- **Output JSON schema (`DocumentationResult`):**

```json
{
  "existingDocsQuality": "poor | basic | good | excellent",
  "missingSections": ["string"],
  "suggestedReadmeImprovements": ["string"],
  "generatedSnippets": [
    { "target": "string (file or section)", "content": "string (markdown)" }
  ]
}
```

- **Dependency:** none.

### 2.7 Improvement Roadmap Creation — user-selectable, runs LAST if selected

- **Purpose:** Synthesize a prioritized action plan from whichever other agents actually ran.
- **JSON structure constraint:** the model must output JSON matching the precise schema defined for that agent, which is immediately parsed and validated by a Zod schema before being written to the session.
- **Inputs:** the structured JSON results of every other agent that was selected and completed in this run. If the user selects **only** Improvement Roadmap and nothing else, the orchestrator must still run the Planning Agent's summary as minimal input (Improvement Roadmap cannot run on zero input) — see DECISIONS.md for this edge case.
- **Output JSON schema (`ImprovementRoadmapResult`):**

```json
{
  "prioritizedTasks": [
    {
      "phase": "string",
      "title": "string",
      "description": "string",
      "difficulty": "easy | medium | hard",
      "estimatedImpact": "high | medium | low"
    }
  ],
  "longTermVision": "string"
}
```

- **Dependency:** all other selected agents must complete first (or, in the zero-other-agents edge case, the Planning Agent's summary).

## 3. Concurrency & Ordering Rules

- Planning Agent: always first, blocking (nothing else starts until it returns).
- Concurrent standard agents: Code Review, Security, Performance, Architecture, and Documentation can all run entirely in parallel as soon as Step 1 (Planning) has populated the core `RepositoryContext`.
- Improvement Roadmap: held back by the orchestrator until every other selected agent has reached a terminal state (complete or error). Runs using only the successful outputs; if an agent errored, Improvement Roadmap notes that gap in `summary` rather than failing.

## 4. Error Handling & Retries

- A single agent's failure (LLM error, malformed response failing schema validation, timeout) emits `agent-error` for that agent only.
- The orchestrator retries a failed agent call once automatically (via `llm.service`) before marking it as errored — see DECISIONS.md for retry policy specifics.
- Session-level failure (e.g. GitHub repo not found, GitHub rate limit exhausted) fails fast at Step 2, before any agent runs, with a clear error returned to the frontend.
