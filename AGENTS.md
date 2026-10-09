# AGENTS.md

Guidance for coding agents working in this repository (the Aselo frontend monorepo).
Package-specific instructions live in an `AGENTS.md` inside each package directory;
read the one for the package you are changing.

## Repository layout

| Directory | What it is | Agent instructions |
| --- | --- | --- |
| `plugin-hrm-form/` | Twilio Flex plugin (React + TypeScript) — the Aselo counsellor UI | [`plugin-hrm-form/AGENTS.md`](plugin-hrm-form/AGENTS.md) |
| `aselo-webchat-react-app/` | Aselo Webchat client (React + TypeScript) | [`aselo-webchat-react-app/AGENTS.md`](aselo-webchat-react-app/AGENTS.md) |
| `lambdas/` | AWS Lambdas and shared packages (npm workspaces) | [`lambdas/AGENTS.md`](lambdas/AGENTS.md) |
| `e2e-tests/` | Playwright end-to-end tests | — |
| `twilio-iac/` | Terraform / infrastructure as code | — |
| `scripts/` | Helper scripts (config, SSM credentials, etc.) | — |

Note: `plugin-hrm-form` and `aselo-webchat-react-app` both depend on
`lambdas/packages/hrm-form-definitions` and `lambdas/packages/hrm-types`; their
`preinstall` scripts build those packages, so changes there can affect both front ends.

## Coding standards

Follow the Aselo coding standards at https://github.com/techmatters/aselo-coding-standards
when writing or reviewing code in this repository.

## Licence headers

All source files (outside `twilio-iac/` and `scripts/`) carry the AGPL licence header from
`license-header.tpl`, with the holder "Technology Matters". Add it to any new source
file — copy the header from a neighbouring file, keeping the same comment style.

## Secrets

This is a public repository. Never commit credentials, account SIDs, tokens or other
private data. The repo uses `git-secrets` hooks (`.githooks/`). Local-only config files
such as `plugin-hrm-form/public/appConfig.js` and `plugin-hrm-form/src/private/secret.js`
are git-ignored — keep it that way.

## Pull requests

Follow [`PRGuidelines.md`](PRGuidelines.md): keep PRs reviewable in size, use a clear title
and a description that explains the why, add unit tests, keep UI changes accessible, make
new UI strings localisable, and remove commented-out code before asking for review.

Write PR descriptions using the template in
[`.github/pull_request_template.md`](.github/pull_request_template.md): keep all its
sections (Description, Checklist, Other Related Issues, Verification steps, AFTER YOU
MERGE), tick only the checklist items that actually apply, and put the primary issue key
(e.g. `CHI-1234`) in the PR title.
