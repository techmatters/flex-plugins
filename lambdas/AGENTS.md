# AGENTS.md — lambdas

See also the [root AGENTS.md](../AGENTS.md).

This directory is an npm workspaces project; run all commands below from `lambdas/`.

## Validation before requesting a PR review

Before opening a PR or requesting a review, run these checks and fix anything they raise.
There is no need to run them after every individual edit.

1. `npm ci` — prepare the workspace
2. `npm run build` — TypeScript must compile
3. `npm run test:unit` — unit tests must pass
4. `npm run test:service` — service tests must pass
5. `npm run lint:fix` — lint must be clean (auto-fixes what it can)

If any step fails, fix the problem and start again from step 1 until you get a clean run.
