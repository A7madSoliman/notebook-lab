# Task Foundation

Branch: `feature/task-foundation`

Purpose: establish the pure task contract and replaceable local persistence boundary.

Tasks: [T01](T01-domain-repository.md), [T02](T02-local-persistence.md)

Dependency: initial product foundation; later features depend on this boundary.

Scope boundary: domain types, repository contract, local persistence, and deterministic data failures. No UI or API implementation.

Feature Done: both tasks are repository-finalized, feature verification passes, and the feature PR is merged to `main`.
