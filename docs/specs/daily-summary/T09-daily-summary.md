---
id: T09
feature: daily-summary
branch: feature/daily-summary
depends_on:
  - T08
status: repository_finalized
---

# T09 — Daily Summary

## Objective

Add reusable daily statistics and a lightweight secondary summary UI.

## Requirements

Derive total, completed, incomplete, and completion percentage (`0` when total is zero) in pure/reusable logic, without duplicating calculations in presentation. Keep the UI calm and secondary; avoid dashboard/card overload.
