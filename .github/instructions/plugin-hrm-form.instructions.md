---
applyTo: "plugin-hrm-form/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- Ensure the typescript compiles by running tsc on the plugin-hrm-form module
- Ensure the unit tests pass by running the test script in plugin-hrm-form/package.json
- Ensure the code changes are correctly linted by running eslint using the configuration in the plugin-hrm-form directory

When debugging the flex website, you can use the version deployed to Aselo Development. To login run the oktaSsoLoginViaApi function under in e2e-tests/okta/ssoLogin.ts
You should pass in the parameters from variables set in the chrome devtools MCP environment, SITE_PASS for password, SITE_USER for username, SITE_ACCOUNT_SID for accountSid and 'https://flex.twilio.com/' as the homeUrl