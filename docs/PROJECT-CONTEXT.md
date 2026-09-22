# Notebook Lab — Project Context

## Purpose and scope

Notebook Lab is a small personal task and productivity application for creating, editing, deleting, completing, and reopening tasks; viewing today's tasks; and viewing lightweight daily/monthly summaries with monthly completion percentage.

## Current non-goals

- No backend, API contract, authentication, multi-user support, sync, sharing, notifications, or speculative persistence migrations.
- No component library, global state solution, or dependency added merely for convenience.
- No dashboard-heavy or unrelated product features.

## Technical baseline

- Next.js App Router 16.3.5, React 19.2.8, React DOM 19.2.8.
- TypeScript 5.9.3, strict mode, no emit, bundler resolution, and `@/*` root alias.
- npm with lockfile version 3; Tailwind CSS 4.3.3 through `@tailwindcss/postcss`.
- ESLint 9.39.5 with the Next core-web-vitals and TypeScript presets; no Prettier or test runner.
- Scripts: `dev`, `build`, `start`, and `lint`.
- Root `app/` contains the App Router route/layout. Domain contracts live in `domain/tasks/`; repository contracts and local persistence live in `data/tasks/`.

## Dependency policy

The installed Next.js, React, TypeScript, Tailwind, browser APIs, `Intl`, and CSS capabilities are sufficient for the initial product. Evaluate a test runner, date/form/validation/icon/animation tool only when a concrete limitation is demonstrated; explain why existing APIs are insufficient before adding one.

## Architecture and ownership

Preferred flow: `UI → feature logic → repository boundary → local/API implementation`.

- `app/` — routes, layouts, metadata, and thin route composition; Server Components by default.
- `features/tasks/` — task-specific UI and interaction logic.
- `domain/tasks/` — pure task types, rules, and derived calculations; no React or browser dependencies.
- `data/tasks/` — repository contracts and persistence/API adapters; UI never accesses storage directly.
- `components/ui/` — only genuinely reused presentation primitives.
- `lib/` — truly generic infrastructure, not feature logic.
- `docs/` — durable project documentation, not runtime code.

Keep the repository shallow, preserve root-level `app/`, avoid empty/speculative folders, and keep product files reachable within roughly 2–4 directories.

## Data and API readiness

- `Task.date` is a user-local `YYYY-MM-DD` calendar value with no time or offset.
- `createdAt` and `updatedAt` are ISO-8601 instants; JavaScript `Date` objects do not cross repository contracts.
- Repository date ranges use inclusive calendar dates.
- The current local adapter uses `notebook-lab.tasks.v1`; malformed persisted data is preserved and surfaced, never silently reset or overwritten.
- Storage failures surface through the data boundary. Update requires an existing task; deleting a missing task is an idempotent no-op.
- Keep future API mapping, transport, authentication, and server contracts behind the repository boundary; do not invent an API shape.

## Temporary domain assumptions

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

Create/update callers do not own generated IDs or timestamps. Derived statistics are reusable logic: total, completed, incomplete, and `completed / total * 100`, with zero when total is zero.

## Product quality and visual direction

Notebook Lab should feel simple, calm, clean, lightweight, uncluttered, easy to scan, and comfortable for repeated daily use. Clarity is more important than decoration. Use readable typography, restrained color, accessible contrast, clear task states, useful spacing, strong mobile usability, and sufficiently large touch targets. Avoid excessive gradients, glassmorphism, shadows, decorative cards, dashboard treatment, visual noise, and decorative animation.

Design for desktop, laptop, tablet, mobile, and small mobile; account for wrapping, reflow, touch/input ergonomics, action placement, overflow, and keyboard behavior without hiding essential functionality.

Use semantic HTML, keyboard navigation, visible focus, associated labels, correct button/link semantics, and ARIA only where needed. Provide relevant loading, success, empty, error, and retry states. Avoid unnecessary effects, re-renders, DOM, and global state. Motion is optional, subtle, purposeful, non-blocking, and must respect `prefers-reduced-motion`; prefer CSS/platform capabilities.

## Execution reference

Agent roles, delegation, planning, reporting, status transitions, external approval, Git finalization, and feature integration rules live in [docs/WORKFLOW.md](WORKFLOW.md).
