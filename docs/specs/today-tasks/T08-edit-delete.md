---
id: T08
feature: today-tasks
branch: feature/today-tasks
depends_on:
  - T07
status: implementation_pass_awaiting_external_review
---

# T08 — Edit and Delete

## Objective

Support editing mutable task fields and deleting tasks without exposing generated persistence fields.

## Requirements

Provide accessible editing, repository failure handling, appropriate confirmation, idempotent delete semantics, keyboard/mobile behavior, and list consistency after mutation.
