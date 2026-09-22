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

## Repository and Git workflow

- Repository: `A7madSoliman/notebook-lab`; stable/default branch: `main`.
- Use one branch per product feature. Multiple scoped task commits may live on that branch; never implement product work directly on `main`. Start every feature branch from the latest verified `main`.
- Planned branches: `feature/task-foundation`, `feature/app-shell`, `feature/today-tasks`, `feature/daily-summary`, `feature/monthly-summary`, and `feature/ux-quality`.
- Task lifecycle: plan → plan review → implementation → independent Codex verification → commit only after PASS → push the feature branch.
- Feature lifecycle: complete feature tasks → final verification → push → PR to `main` → verify PR scope → merge → synchronize local `main` → create the next branch from updated `main`. Preserve meaningful task commits; do not automatically squash them.
- Antigravity Git/GitHub execution is currently unavailable: its sandboxed authentication/environment probe failed. Main Codex is the active post-verification Git executor in this environment. Do not retry Antigravity on every task; re-test only after its credentials or environment are intentionally repaired or changed. OpenCode never performs Git mutations.
- Git work is a separate post-verification phase: inspect staged changes before every commit; commit no unrelated files, secrets, tokens, `.env` files, or machine-specific sensitive data; never silently include untracked files. Delegates do not commit during implementation.
- Never use destructive Git commands, force-push, or commit before Codex verification passes unless the user explicitly authorizes the exceptional action.
- Prefer one meaningful commit per completed task and clear Conventional Commit-style messages, for example `feat(tasks): add task repository contract` or `docs: update project context`.
- For each verified task on a feature branch: implementation → Codex verification → PASS → inspect diff/status → stage only intended files → commit → push the current branch. Never commit failed, unverified, or unrelated work.
- After the last feature task: run final feature verification → push → create a PR to `main` → inspect its scope/diff → merge with a normal merge commit → synchronize local `main` with `origin/main` → verify equality → then branch again. Never merge a partially complete feature.

## Execution roadmap

This directional roadmap contains the final context task plus 14 product tasks (15 planned tasks in this phase). A later verified finding may split or adjust a task when necessary, but must not silently expand scope.

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

A completed task meets its acceptance criteria, respects this architecture and scope, handles relevant UI states, is accessible and responsive, keeps persistence out of UI, verifies its own changes with available project checks, and leaves unrelated work untouched.
