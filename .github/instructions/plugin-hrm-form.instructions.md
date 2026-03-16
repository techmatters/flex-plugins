---
applyTo: "plugin-hrm-form/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- Ensure the typescript compiles by running tsc on the plugin-hrm-form module
- Ensure the unit tests pass by running the test script in plugin-hrm-form/package.json
- Ensure the code changes are correctly linted by running eslint using the configuration in the plugin-hrm-form directory

When debugging the flex website, you can use run a local version, following these steps:
1. Create an appConfig.js under plugin-hrm-form/public - replace the top 3 placeholder values with environment variables, accountSid is SITE_ACCOUNT_SID, connection is SITE_CONNECTION_SID and clientId IS SITE_CLIENT_ID
2. Run `npm run dev` from plugin-hrm-form
3. To login run the oktaSsoLoginViaApi function under in e2e-tests/okta/ssoLogin.ts. You should pass in the parameters from variables set in the chrome devtools MCP environment, SITE_PASS for password, SITE_USER for username, SITE_ACCOUNT_SID for accountSid and 'https://localhost:3000' as the homeUrl