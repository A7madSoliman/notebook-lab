# Notebook Lab — Execution Workflow

## Roles

- **Main Codex:** plans, orchestrates, evaluates OpenCode feedback, independently verifies, reports, and performs Git operations only after external approval.
- **OpenCode:** read-only plan reviewer; no workspace or Git mutation.
- **Antigravity:** implements the approved plan within scope; makes no broad architecture decisions and never commits or pushes.

Current Git executor: Main Codex. Antigravity Git remains disabled until intentionally repaired and revalidated.

## Antigravity execution environment

On the current Windows environment, Antigravity authentication is available to the host user session but not to the Codex sandbox identity. All delegated `agy` implementation runs must therefore use the authenticated host/elevated execution context (`sandbox:false`, or the equivalent supported host mechanism). Do not request interactive authentication when host `agy models` succeeds. Do not copy, export, print, or store Antigravity credentials in the repository, and do not globally disable sandboxing for unrelated tools. If the execution environment changes, Main Codex may re-probe host and sandbox access and remove this requirement only after both contexts are verified equivalent.

Main Codex orchestrates delegation and explicitly requests host execution for `agy` when required. OpenCode remains the normal configured read-only reviewer. Antigravity remains the implementation lane using `gemini-3.8-flash-low` with `effort: low`; the host-execution rule is an Antigravity-specific exception.

## Standard task flow

Read context, feature/task specs, and code → Codex Plan → OpenCode Review → Codex Revision → optional second review → Antigravity Implementation → Codex Verification → Technical PASS → evidence-rich report → STOP → external review → approval → next prompt finalizes Git.

Maximum plan-review rounds: **2**.

Technical PASS is not Git authorization. Before external approval: no staging, commit, push, PR, merge, or next task.

## Next-prompt Phase A

After approval, verify the expected branch, approved diff, unchanged state, and absence of unrelated files. Update the approved task status deterministically, stage only approved files, commit, push, and verify remote synchronization. Only then execute the new task.

If external review rejects work, do not finalize Git. Use a bounded correction plan, implementation, verification, and a new report awaiting approval.

## Feature integration

After the final approved task is finalized: run feature verification, push, create and inspect a PR, merge with a normal merge commit, synchronize local `main`, verify equality with `origin/main`, then create the next feature branch.

## Remote PR / Merge Fallback

Local Git finalization and remote GitHub integration are separate capabilities. The preferred flow is: Main Codex commits, pushes, creates and inspects the PR, merges it, then synchronizes local `main`.

If local GitHub PR/merge authentication or tooling is unavailable, Main Codex must still complete authorized local work: commit the approved task, push the feature or infrastructure branch, and verify remote branch synchronization. It must not bypass PR review by merging locally and pushing `main`.

Main Codex must report `PR_INTEGRATION_BLOCKED` with the repository, head branch, base branch, remote head SHA, expected PR title, and verified changed-file scope. An externally authenticated GitHub integration may then create and inspect the PR and merge it after verification. That integration must provide the resulting merge confirmation or merge SHA.

The next local prompt fetches remote state, synchronizes local `main` with `origin/main`, verifies the expected merge, and resumes the normal workflow. If neither local nor external authenticated integration is available, stop and report the blocker. External GitHub integration may perform only the PR/merge stage after task external approval, the local approved commit and push, feature-level verification, and verified PR scope.

## Source hierarchy

Resolve guidance in this order:

1. Explicit current user instruction
2. `docs/PROJECT-CONTEXT.md`
3. `docs/WORKFLOW.md`
4. Current feature `FEATURE.md`
5. Current `Txx` task spec
6. Actual repository code

Code is implementation reality. If it materially conflicts with a spec, do not silently rewrite broad areas: identify the conflict. Small, non-scope-changing clarifications may be included in the current plan; material architecture or scope changes stop for a decision.

## Task status lifecycle

Allowed statuses:

- `planned` — not started.
- `in_progress` — being executed.
- `implementation_pass_awaiting_external_review` — technically verified, not Git-authorized.
- `repository_finalized` — externally approved, committed, and pushed.

At task start: `planned → in_progress`. At Technical PASS: `in_progress → implementation_pass_awaiting_external_review` in the uncommitted task diff. After approval, the next prompt may transition it to `repository_finalized` immediately before committing.

## Evidence-rich external reports

Every report awaiting external review must include:

1. Technical PASS/FAIL and current branch.
2. Plan-review findings and actual implementation lane/model.
3. Exact changed files and `git diff --stat`.
4. Important public interfaces/contracts and behavioral decisions.
5. `Unexpected diff: NONE` or an explicit explanation.
6. Verification commands/results, scope compliance, risks/follow-ups, and Git status.

Architecture/data reports should include concise signatures or representative snippets when they improve reviewability, never the full diff unless requested. Every report ends exactly with:

- After Technical PASS:

```text
Git finalization:
NOT STARTED — awaiting external review approval.

Next task:
NOT STARTED.
```

- If blocked or failed before Technical PASS:

```text
Git finalization:
NOT APPLICABLE — task has not reached Technical PASS.

Next task:
NOT STARTED.
```

## Safety

No destructive Git commands, force push, secrets, or silent unrelated-file inclusion. Preserve `.agents/`, `.delegate/`, and `skills-lock.json` unless explicitly requested. Delegation and Git finalization are separate phases.

## Short future invocation

Read `AGENTS.md`, `docs/PROJECT-CONTEXT.md`, `docs/WORKFLOW.md`, the current `FEATURE.md`, the current task spec, and relevant code. First finalize any previously approved task according to Phase A. Then execute the current task through the configured fleet, stop after Technical PASS, and return the evidence-rich report. Do not Git-finalize the current task.
