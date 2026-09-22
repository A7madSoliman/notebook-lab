# Notebook Lab — Project Context

## Purpose

Notebook Lab is a small personal task and productivity application. The current repository is a starter scaffold; this document is the project contract for future work.

## Initial scope

- Create, edit, delete, complete, and reopen tasks.
- View today's tasks, a daily summary, and a monthly summary with monthly completion percentage.

## Current non-goals

- No backend, API, authentication, multi-user support, sync, sharing, notifications, or final backend contract.
- No package installation, global state solution, or component library by default.
- Do not build speculative screens, workflows, or persistence migrations before a task requires them.

## Technical baseline

- Next.js App Router 16.3.5, React 19.2.8, React DOM 19.2.8.
- TypeScript 5.9.3 with strict mode, no emit, bundler module resolution, and `@/*` root alias.
- npm with `package-lock.json` lockfile version 3.
- Tailwind CSS 4.3.3 through `@tailwindcss/postcss`; global styles are in `app/globals.css`.
- ESLint 9.39.5 with `eslint-config-next` core-web-vitals and TypeScript presets; no Prettier configuration.
- Scripts: `dev`, `build`, `start`, and `lint`. No test runner or test scripts are configured.
- One `/` App Router route exists (`app/page.tsx`) plus `app/layout.tsx`; both retain Create Next App starter content. There are no product components, hooks, utilities, state-management, form, validation, date/time, animation, icon, persistence, data-layer, API, or test files.

## Current dependencies and policy

### Installed and useful

- `next`, `react`, `react-dom`, TypeScript, Tailwind, and the Next ESLint configuration are sufficient for the initial product.
- React state, semantic HTML, browser `localStorage`, `Intl`, and CSS transitions can cover the initial interaction, persistence, date formatting, summaries, and subtle motion needs.

### Installed but currently unnecessary as direct product tools

- `@types/node`, `@types/react`, `@types/react-dom`, and `@tailwindcss/postcss` support the toolchain rather than product features; retain them.

### Potentially useful later

- A test runner, focused date utilities, form/validation tooling, an icon set, or animation tooling may be evaluated only when a concrete task exposes a limitation of platform APIs and the current stack.

### Missing and likely required now

- None. Do not add a dependency merely for convenience. Before proposing one, state the problem, how the existing stack can solve it, and why the dependency is justified over that option.

## Repository structure and architecture

Keep route files thin and preserve the following dependency direction:

`UI → feature logic → repository/service boundary → local implementation`

Future API work should replace only the implementation behind that boundary:

`UI → feature logic → repository/service boundary → API implementation`

For this App Router project, keep pages and layouts server components by default. Put only interactive task UI and browser persistence behind small client-component boundaries. UI components must not read or write `localStorage` or mock arrays directly.

Keep the repository shallow and feature-oriented. Preserve the existing root-level `app/`; do not move it to `src/` without a concrete requirement. Do not create empty architecture folders in advance; a developer should normally reach a product file within roughly 2–4 directories from the root.

When implementation begins, favor the smallest structure that communicates ownership:

- `app/` — Next.js routes, layouts, metadata, and thin route composition.
- `features/tasks/` — task-specific UI and interaction/application logic; add `components/` or `hooks/` only once files require them.
- `domain/tasks/` — pure types, rules, and derived calculations; no React, browser storage, or presentation dependencies.
- `data/tasks/` — repository contracts, local persistence adapters, and later API adapters.
- `components/ui/` — genuinely reused visual primitives only.
- `lib/` — genuinely generic infrastructure helpers, never a feature-logic dumping ground.
- `docs/` — durable documentation, never runtime source.

Ownership: route/layout → `app/`; task UI/interaction → `features/tasks/`; task rules/calculations → `domain/tasks/`; persistence/backend-facing code → `data/tasks/`; shared visual primitive → `components/ui/`; generic infrastructure → `lib/`. If ownership is unclear, keep code close to its feature. Avoid generic top-level `hooks/`, `utils/`, `types/`, or `services/` folders when ownership is feature-specific. Avoid deep paths such as `features/tasks/presentation/components/forms/create/fields/`.

## Data and API readiness

- Define a repository interface around task operations; feature logic depends on that interface, not on storage details.
- Task dates are user-local `YYYY-MM-DD` calendar values; `createdAt` and `updatedAt` are ISO instants.
- Repository date ranges use inclusive calendar dates (`from` and `to`).
- JavaScript `Date` objects do not cross repository contracts.
- The initial implementation may use a local browser persistence adapter. Handle browser-only access inside the adapter/client boundary.
- Persist tasks locally under the versioned key `notebook-lab.tasks.v1`.
- Malformed or corrupt persisted data is preserved and surfaced as a data error rather than silently reset, cleared, or overwritten.
- Storage failures (unavailability, read, write) surface at the data boundary with stable error codes.
- Update requires an existing task; deleting a non-existent task is an idempotent no-op.
- Invalid date inputs and inverted date ranges fail explicitly at the boundary.
- Keep API mapping, authentication, transport details, and server contracts out of UI and domain code. Do not invent the future API shape.

## Temporary domain assumptions

Until product requirements refine it, a task may be modeled as:

```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
};
```

Derived daily and monthly values belong in reusable domain or feature logic: total, completed, incomplete, and `completed / total * 100`; use `0` when total is zero. Presentation components do not duplicate these calculations.

## UI quality rules

- Design for desktop, laptop, tablet, mobile, and small mobile widths.
- Use semantic HTML, keyboard operation, visible focus states, associated form labels, and correct button/link semantics. Add ARIA only when native semantics are insufficient.
- Provide relevant loading, success, empty, error, and meaningful retry states.
- Keep state local where practical, avoid unnecessary effects and re-renders, and keep the DOM modest.
- Motion must be subtle and purposeful (for example completion, insertion/removal, or dialog transitions) and respect `prefers-reduced-motion`.

## Visual direction

Notebook Lab should be simple, calm, clean, lightweight, uncluttered, easy to scan, visually consistent, and comfortable for repeated daily use. Clarity is more important than decoration: every visible element needs a purpose.

- Use generous but efficient spacing, readable typography and line heights, restrained color, accessible contrast, obvious primary actions, clear task states, useful subtle borders/shadows, consistent radius/spacing, strong mobile usability, and large touch targets.
- Daily task management is primary. Summary/statistics UI is secondary and lightweight—use grouped information such as “Today / 12 tasks / 8 completed / 67%” rather than unnecessary cards or a dashboard treatment.
- Avoid default glassmorphism, excessive gradients/shadows/color/animation, oversized dashboard UI, decorative cards, visual noise, and effects that compete with tasks.

## Design system and motion

- Use Tailwind and small project-owned primitives; do not introduce a component library now.
- Establish repeated spacing, typography, radii, surfaces, borders, focus treatment, and motion timing incrementally. Promote Button/Input-like controls to `components/ui/` only after real reuse; keep feature controls within the feature.
- Responsive design is not desktop shrinking. Account for reflow, title wrapping, touch/input ergonomics, action placement, overflow, summary layout, spacing, and mobile keyboard behavior at desktop, laptop, tablet, mobile, and small-mobile widths. Never hide essential functionality for layout convenience.
- Motion is optional and purposeful: creation, completion/reopen feedback, removal, dialogs, and lightweight state transitions are reasonable candidates. It must clarify change, stay subtle, avoid blocking interaction/layout thrashing, and respect `prefers-reduced-motion`. Do not add an animation library until CSS/React is insufficient for a concrete need.

## Delegation workflow

- Main Codex: planning, architecture, orchestration, and independent final verification.
- OpenCode `plan-review` lane: read-only independent plan critique; no workspace changes.
- Antigravity `implementation` lane: implements an approved plan within scope.
- Standard flow: Codex plan → OpenCode review → Codex revision → optional second OpenCode review → Antigravity implementation → Codex verification. Limit plan review to two rounds.
- Delegates may not make broad architectural changes without explicit main-orchestrator approval.
- OpenCode performs no Git mutation. Antigravity makes no architecture decision outside an approved plan and never commits or pushes. Main Codex owns planning, reviewer evaluation, verification, reporting, and Git finalization only after external approval. The external/user reviewer decides whether a technically passing task may enter Git history.

## Task review and Git approval gate

Every substantial task: read this context → inspect scope → Codex plan → read-only OpenCode review → Codex final plan → Antigravity implementation → Codex independent verification and relevant lint/type/build checks → final task report → STOP.

Technical PASS means the implementation passed Codex verification and project checks. It is not authorization to finalize Git. A passing task enters `IMPLEMENTATION_PASS_AWAITING_EXTERNAL_REVIEW`; this is expected, not an error.

Until explicit external/user approval, do not stage, commit, push, create a PR, merge, or begin the next task. Every implementation report must state technical status, branch, plan-review results, implementation summary, changed files, verification results, scope compliance, outstanding risks/findings, and Git status, then end with `Git finalization: NOT STARTED — awaiting external review approval.` and `Next task: NOT STARTED.`

The next prompt after approval begins with **Phase A — Finalize Previous Approved Task**: verify the expected branch, status, complete approved diff, unchanged state, and absence of unrelated files; rerun targeted verification only if state materially changed; then stage only approved files, commit, push, and verify local HEAD equals the remote branch HEAD. Only then begins **Phase B — Execute Current Task**.

If external review rejects work, do not commit it. The next prompt is a correction task: analyze findings → bounded correction plan → plan review when materially needed → implementation → Codex verification → updated report → STOP for external approval again.

## Repository and Git workflow

- Repository: `A7madSoliman/notebook-lab`; stable/default branch: `main`.
- Use one branch per product feature. Multiple scoped task commits may live on that branch; never implement product work directly on `main`. Start every feature branch from the latest verified `main`.
- Planned branches: `feature/task-foundation`, `feature/app-shell`, `feature/today-tasks`, `feature/daily-summary`, `feature/monthly-summary`, and `feature/ux-quality`.
- Each externally approved task receives its own commit on its feature branch, but Git finalization occurs only through the next-prompt Phase A gate. T01 was already finalized under the previous workflow; preserve that history accurately.
- A feature stays open until every assigned task is externally approved and repository-finalized. After the last approved task is finalized: run feature-level verification → push → create and inspect a PR to `main` → merge with a normal merge commit → synchronize local `main` with `origin/main` → verify equality → create the next feature branch. Never merge a feature with an unreviewed task.
- Antigravity Git/GitHub execution is currently unavailable: its sandboxed authentication/environment probe failed. Main Codex is the active post-verification Git executor in this environment. Do not retry Antigravity on every task; re-test only after its credentials or environment are intentionally repaired or changed. OpenCode never performs Git mutations.
- Git work is a separate post-approval phase: inspect staged changes before every commit; commit no unrelated files, secrets, tokens, `.env` files, or machine-specific sensitive data; never silently include untracked files. Delegates do not commit during implementation.
- Never use destructive Git commands, force-push, or commit before Codex verification passes unless the user explicitly authorizes the exceptional action.
- Prefer one meaningful commit per completed task and clear Conventional Commit-style messages, for example `feat(tasks): add task repository contract` or `docs: update project context`.

## Execution roadmap

This directional roadmap contains the final context task plus 14 product tasks (15 planned tasks in this phase). A later verified finding may split or adjust a task when necessary, but must not silently expand scope. Every feature-level verification, PR, and merge below occurs only after its tasks are externally approved and Repository Finalized.

- Bootstrap: T00 project discovery; T00.1 Git/GitHub workflow; T00.2 context, structure, and visual direction.
- `feature/task-foundation`: T01 task domain model and repository contract; T02 local persistence plus async/error semantics; final verification → PR → merge.
- `feature/app-shell`: T03 responsive application shell; T04 only shared UI primitives currently required; final verification → PR → merge.
- `feature/today-tasks`: T05 today list and relevant loading/empty/error states; T06 create task; T07 complete/reopen; T08 edit/delete; final verification → PR → merge.
- `feature/daily-summary`: T09 daily derived statistics and lightweight summary UI; final verification → PR → merge.
- `feature/monthly-summary`: T10 monthly aggregation/domain logic; T11 monthly summary and completion percentage UI; final verification → PR → merge.
- `feature/ux-quality`: T12 responsive/accessibility audit and fixes; T13 purposeful motion and performance polish; final verification → PR → merge.
- Final: T14 regression, architecture, persistence, and future API-readiness audit.

For every substantial task, Main Codex reads this context and relevant code, produces a bounded plan, obtains up to two OpenCode plan-review rounds, evaluates rather than blindly applying critique, delegates approved implementation to Antigravity, and independently verifies the result. Main Codex owns final architecture decisions.

## Scope and Git safety

- Inspect the working tree before work; preserve pre-existing user changes.
- Do not install packages, stage, commit, revert, or clean unless a task explicitly authorizes it.
- Make only task-scoped edits. Verify the diff, relevant scripts, and accessibility/responsive impact before handoff.

## Definition of done

**Implementation Done:** acceptance criteria met; architecture and scope respected; relevant UI requirements met; verification passed; report produced; awaiting external review.

**Repository Finalized:** explicit external approval received; only intended changes committed; branch pushed and synchronized. A feature is not integration-complete until all its tasks are Repository Finalized and its verified PR is merged.
