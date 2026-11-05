---
title: Publish a draft
kind: guide
audience: aselo
order: 51
questions:
  - how do I publish a draft
  - how do I apply the changes
  - download as zip
  - open the pull request
keywords: publish, apply, download, zip, pull request, pr, deploy, merge, changes.md, discard
---

While the builder doesn't write to GitHub, the last steps are by hand.

1. In **Review & apply**, click **Download as zip**: the changed files laid out like the flex-plugins repo, and a `CHANGES.md`.
2. In a flex-plugins checkout, from an up-to-date master, make a branch and unzip at the root.
3. Check `git diff` and run `npm test` in `lambdas/packages/hrm-form-definitions`.
4. Commit, push and open a PR, with `CHANGES.md` as its description.
5. Once merged, deploy what `CHANGES.md` lists: form definitions (the Deploy form-definitions to S3 workflow), the webchat if its texts changed, the service configuration if it changed.
6. Back in the builder, **Discard draft**.

A version imported from a branch is unzipped in a checkout of that branch instead, and committed there.
