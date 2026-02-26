# OmniWallet Othala Operator Context

## Branch / Commit Clarity (MANDATORY)
- Do NOT use opaque phrasing in task output.
- Favor feature-scoped language: `feat(area): ...`, `fix(area): ...`, `test(area): ...`, `chore(area): ...`.
- Keep each change small and isolated.

## Commit Granularity (MANDATORY)
- Every small feature or fix should be its own commit.
- Avoid giant mixed commits.
- If a task touches multiple areas, split into multiple commits.

## Reliability Rules
- If Graphite branch metadata is missing, track branch before modify/commit.
- Keep formatter/test gates green before signaling patch readiness.
- Report blockers once with concrete task IDs and the exact failing command.

## Merge Hygiene
- Prefer meaningful commit messages over chat/task IDs.
- Ensure final branch history is understandable by humans reading `git log --oneline`.
