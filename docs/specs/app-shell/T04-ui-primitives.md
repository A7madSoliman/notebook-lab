---
id: T04
feature: app-shell
branch: feature/app-shell
depends_on:
  - T03
status: repository_finalized
---

# T04 — Shared UI Primitives

## Objective

Create or extract only the genuinely shared primitives justified by the actual shell and next feature.

## Scope and boundaries

Button, input, or compact surface/container are possibilities, not commitments. Require semantic correctness, visible focus, accessible variants, and feature-specific controls remaining in their feature. Do not build a speculative component library or add a dependency.

## Acceptance / Verification

Every primitive has real reuse, a small clear API, keyboard accessibility, responsive behavior, and project checks. Verify no duplicate feature-specific abstractions were introduced.
