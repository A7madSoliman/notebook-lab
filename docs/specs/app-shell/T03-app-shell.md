---
id: T03
feature: app-shell
branch: feature/app-shell
depends_on:
  - T02
status: repository_finalized
---

# T03 — Application Shell

## Objective

Replace the Create Next App presentation with Notebook Lab's calm, task-first responsive shell.

## Scope

Keep `app/page.tsx` thin; clean root layout/metadata as needed; establish responsive container, typography, surfaces, spacing, semantic landmarks, mobile-first usability, and removal of starter/demo presentation.

## Non-Goals

No task list or CRUD behavior, fake product data, direct storage access, UI library, or animation library.

## Acceptance / Verification

Follow the visual direction in `PROJECT-CONTEXT.md`; verify desktop through small-mobile layout, semantics, focus, lint, typecheck, build, and no data-layer coupling.
