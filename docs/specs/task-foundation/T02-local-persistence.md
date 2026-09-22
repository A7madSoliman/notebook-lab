---
id: T02
feature: task-foundation
branch: feature/task-foundation
depends_on:
  - T01
status: repository_finalized
---

# T02 — Local Task Persistence

## Objective

Implement the first replaceable asynchronous `TaskRepository` adapter using browser-local persistence.

## Final decisions

- `LocalTaskRepository` persists a single task array under `notebook-lab.tasks.v1`.
- Browser storage is resolved lazily and safely for SSR; a minimal injected storage boundary supports verification.
- Persisted data is runtime-validated as a whole. Corrupt raw data is preserved and surfaced through controlled data-layer errors rather than reset or overwritten.
- The repository owns IDs, timestamps, and initial `completed: false` state. Empty/equivalent updates do not write or change `updatedAt`.
- Missing update returns `TASK_NOT_FOUND`; missing delete is an idempotent no-op. Date ranges are inclusive.

## Out of scope

No UI, API adapter, migrations, synchronization, multi-tab coordination, recovery UI, or test-framework installation.
