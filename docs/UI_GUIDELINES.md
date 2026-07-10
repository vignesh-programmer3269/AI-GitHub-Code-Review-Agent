# UI_GUIDELINES.md

## 1. Design Direction

Clean, GitHub-inspired, professional. Not a marketing landing page — this reads like a developer tool. Dense information handled with clear hierarchy, generous whitespace between sections, minimal decoration.

## 2. Color Palette (GitHub light theme reference)

| Token | Hex | Use |
|---|---|---|
| `--bg-canvas` | `#ffffff` | Page background |
| `--bg-subtle` | `#f6f8fa` | Cards, panels |
| `--border-default` | `#d0d7de` | Card borders, dividers |
| `--text-primary` | `#24292f` | Body text |
| `--text-secondary` | `#57606a` | Secondary/muted text |
| `--accent` | `#0969da` | Links, primary buttons, active states |
| `--success` | `#1f883d` | Complete states, low-risk findings |
| `--warning` | `#9a6700` | Medium-severity findings |
| `--danger` | `#cf222e` | Errors, high/critical severity findings |
| `--neutral-badge-bg` | `#eaeef2` | Badges/tags |

Dark mode is not required for v1 but tokens above should be CSS variables so it can be added later without a rewrite.

## 3. Typography

- UI font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Noto Sans, Helvetica, Arial, sans-serif`
- Code/monospace stack (file paths, snippets, hashes): `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`
- Base size 14px for body/UI text (GitHub's own density), 12px for secondary metadata, headings scale up from there (18/20/24px for h3/h2/h1 equivalents).

## 4. Layout

- 8px base spacing grid.
- Max content width ~1080px, centered, with a left-aligned reading column for report content (GitHub PR/README-page feel).
- Sticky top bar with repo name/owner + current session status once a session is active.

## 5. Core Screens / Components

### 5.1 URL Input
- Single text input + "Analyze" button.
- Client-side validation **before** any backend call (per PROJECT_CONTEXT.md requirement): regex-check the input matches a public GitHub repo URL shape (`https://github.com/<owner>/<repo>`), show inline error state immediately on blur/submit if not.
- Disable the button while invalid; no network call is made until valid.

### 5.2 Repo Summary Card
- Shown immediately after Planning Agent returns.
- Repo name, description, primary language + language breakdown as a small horizontal bar, stars/forks, estimated complexity badge.

### 5.3 Agent Selection (Recommendation Checklist)
- One row per selectable agent (the 6 — Planning already ran and isn't shown as a checkbox).
- Each row: checkbox (pre-checked if `recommended: true`), agent name, one-line reason from the Planning Agent, estimated token cost badge.
- "Run Selected Agents" primary button.

### 5.4 Agent Progress Panel
- One row per agent that was selected, updates live from SSE events.
- States: pending (gray dot) → running (animated/pulsing accent dot) → complete (green check) → error (red x, with a short inline error message and a "retry" affordance if applicable).
- Use an `aria-live="polite"` region so status changes are announced for screen readers.

### 5.5 Report View
- Tabbed layout, one tab per agent that ran, in this order: Code Review, Security, Performance, Architecture, Documentation, Roadmap.
- Each tab renders that agent's structured result as formatted content (markdown-rendered where the schema has free text, syntax-highlighted for any code snippets/file references).
- Findings lists use severity-colored left-border or badge (`--success` / `--warning` / `--danger`) matching severity/risk fields in the schemas (see AGENT_WORKFLOW.md).
- **Security tab must always render the `disclaimer` field visibly** (not buried) — this is a heuristic/LLM review, not a certified security scan.

### 5.6 Export Bar
- Two buttons: "Export as PDF", "Export as Markdown".
- Disabled state with tooltip if nothing has completed yet.
- Since sessions are not persisted (see CONTEXT_ENGINE.md §5), show a subtle session-time indicator or at minimum handle export failures due to an expired session with a clear "session expired, please re-run the analysis" message rather than a silent failure.

## 6. Interaction/Accessibility Basics

- All interactive elements keyboard-reachable, visible focus ring using `--accent`.
- Color is never the only signal for severity — always pair with text/icon (e.g. "Critical", "Major") for colorblind accessibility.
- Minimum contrast ratio 4.5:1 for body text against its background per the palette above (already true of GitHub's own palette).
- Streaming updates use `aria-live` regions as noted in §5.4; avoid layout shift when a status icon changes.

## 7. What This UI Should Not Look Like

- No login/signup screens or account menus (no auth in this app — see PROJECT_CONTEXT.md).
- No dashboard-of-past-reports view (no persistence — each session is self-contained).
- No heavy illustration/marketing styling — this is a tool, not a product landing page.
