---
id: T05
feature: today-tasks
branch: feature/today-tasks
depends_on:
  - T04
status: repository_finalized
---

# T05 — Today Task List

## Objective

Load and display tasks for the user's current local calendar day through feature logic and `TaskRepository`.

## Requirements

Cover loading, success, empty, repository error, and meaningful retry states; handle long titles, responsive list layout, and accessible task semantics. Do not implement create/edit/delete, direct storage access, or mock arrays as the real source.

## Verification

Check local-date semantics, keyboard/screen-reader behavior, small screens, failure/retry behavior, and lint/type/build.
