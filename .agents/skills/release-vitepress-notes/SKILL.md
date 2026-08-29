---
name: release-vitepress-notes
description: Build, review, commit, and push this VitePress notes repository when the user explicitly requests publication to its configured Git remote.
---

# Release the VitePress Notes Site

Publish a verified, narrowly scoped commit from this repository. A request to release authorizes the normal build, commit, and push flow, but not force-pushing, tagging, creating a GitHub Release, or including unrelated working-tree changes.

## Establish the release scope

Read `AGENTS.md`, then inspect the current branch, configured remotes, full `git status --short`, and relevant diffs. Identify files created or changed for the user's release request. Preserve unrelated tracked and untracked work and list intentional exclusions in the handoff.

Do not assume every dirty file belongs in the commit. Stage explicit paths rather than using broad patterns when the worktree contains unrelated changes.

## Build before committing

Run the repository's production build from the repository root:

```powershell
npm.cmd run build
```

On systems where `npm` is not blocked by PowerShell execution policy, the ordinary `npm run build` form is also valid.

If the default VitePress output directory is locked, run the required prebuild step and validate through a temporary output directory under `.vitepress`. Verify the resolved temporary path remains inside the repository before recursively removing it. Do not treat a failed build as releasable.

After the build, inspect Git status again. Exclude generated build output unless it is intentionally tracked by this repository.

## Review and commit

Stage only the release files, then inspect:

```powershell
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Resolve real whitespace errors, conflict markers, accidental generated files, or unintended deletions before committing. Use a concise commit subject that describes the published outcome. Do not amend an existing commit unless the user explicitly requests it.

If the commit fails, stop before pushing and report the failure.

## Push safely

Push the new commit to the current branch's configured remote, normally:

```powershell
git push origin HEAD
```

Never use `--force` or `--force-with-lease` unless separately and explicitly authorized. If the remote rejects the push, do not rewrite history automatically; report the rejection and the local commit hash.

## Handoff

Report the production build result, commit hash and subject, pushed remote/branch, and any dirty files intentionally left outside the commit. Confirm the local branch's upstream state after a successful push.
