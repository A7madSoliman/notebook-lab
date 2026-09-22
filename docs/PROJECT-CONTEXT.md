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

## Architecture direction

Keep route files thin and preserve the following dependency direction:

`UI → feature logic → repository/service boundary → local implementation`

Future API work should replace only the implementation behind that boundary:

`UI → feature logic → repository/service boundary → API implementation`

For this App Router project, keep pages and layouts server components by default. Put only interactive task UI and browser persistence behind small client-component boundaries. UI components must not read or write `localStorage` or mock arrays directly.

When implementation begins, favor a small structure such as:

- `app/` — routes, layout, route-level composition.
- `features/tasks/` — task views, feature hooks/actions, and feature-specific UI.
- `domain/tasks/` — task types and pure derived calculations.
- `data/tasks/` — repository interface and local persistence implementation.

Adapt names and placement if a later task establishes an existing convention; do not add layers before they have a job.

## Data and API readiness

- Define a repository interface around task operations; feature logic depends on that interface, not on storage details.
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
- Prefer Antigravity for post-verification Git operations only when its GitHub access is verified in the current environment. Main Codex is the fallback. OpenCode never performs Git mutations. Revalidate access after credential or environment changes.
- Git work is a separate post-verification phase: inspect staged changes before every commit; commit no unrelated files, secrets, tokens, `.env` files, or machine-specific sensitive data; never silently include untracked files. Delegates do not commit during implementation.
- Never use destructive Git commands, force-push, or commit before Codex verification passes unless the user explicitly authorizes the exceptional action.
- Prefer one meaningful commit per completed task and clear Conventional Commit-style messages, for example `feat(tasks): add task repository contract` or `docs: update project context`.

## Scope and Git safety

- Inspect the working tree before work; preserve pre-existing user changes.
- Do not install packages, stage, commit, revert, or clean unless a task explicitly authorizes it.
- Make only task-scoped edits. Verify the diff, relevant scripts, and accessibility/responsive impact before handoff.

## Definition of done

A completed task meets its acceptance criteria, respects this architecture and scope, handles relevant UI states, is accessible and responsive, keeps persistence out of UI, verifies its own changes with available project checks, and leaves unrelated work untouched.
