---
id: T01
feature: task-foundation
branch: feature/task-foundation
depends_on: []
status: repository_finalized
---

# T01 — Task Domain and Repository Contract

## Objective

Define the minimal durable task domain and asynchronous repository boundary.

## Final contract

`TaskId`, `TaskDate`, `Task`, `CreateTaskInput`, `UpdateTaskInput`, and `TaskDateRange` are explicit serializable domain types. `Task` contains `id`, `title`, `completed`, `date`, `createdAt`, and `updatedAt`; callers do not supply generated fields on create or update.

`TaskRepository` exposes asynchronous `listByDate`, inclusive `listByDateRange`, `create`, `update`, and `delete`. Task dates are local-calendar `YYYY-MM-DD` values, timestamps are ISO instants, and JavaScript `Date` objects do not cross the contract. Result ordering is not a presentation guarantee.

## Ownership

Types remain pure in `domain/tasks/`; the interface remains in `data/tasks/`. Adapters implement the boundary without exposing storage or transport details.
