---
applyTo: "lambda/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

1. Prepare the local workspace for validation by running `npm ci` in lambdas/package.json
2. Ensure the typescript compiles by running `npm run build` in lambdas/package.json
3. Ensure the unit tests pass by running `npm run test:unit` in lambdas/package.json
4. Ensure the service tests pass by running `npm run test:service` in lambdas/package.json
5. Ensure the code changes are correctly linted by running `npm run lint:fix` in lambdas/package.json

If any stage raises errors, fix them and start again at step 1, until there is a clean run