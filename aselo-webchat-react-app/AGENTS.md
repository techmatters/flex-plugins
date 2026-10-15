# AGENTS.md — aselo-webchat-react-app

See also the [root AGENTS.md](../AGENTS.md).

Run all commands below from `aselo-webchat-react-app/`.

## Validation before requesting a PR review

Before opening a PR or requesting a review, run these checks and fix anything they raise.
There is no need to run them after every individual edit.

- If dependencies are missing, install them with `npm ci`. (`preinstall` also builds
  `../lambdas/packages/hrm-form-definitions` and `../lambdas/packages/hrm-types`.)
- `npm run build` — TypeScript must compile
- `npm run lint` — lint must be clean (`npm run lint:fix` to auto-fix)
- `npm run test` — unit tests must pass

Do **not** run the end-to-end tests (`npm run test:e2e` / Cypress).

## Debugging

Unless instructed otherwise, use the version deployed to the AS development account:
https://assets-development.tl.techmatters.org/aselo-webchat-react-app/as/
