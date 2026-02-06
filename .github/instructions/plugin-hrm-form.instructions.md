---
applyTo: "plugin-hrm-form/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- Ensure the typescript compiles by running tsc on the plugin-hrm-form module
- Ensure the unit tests pass by running the test script in plugin-hrm-form/package.json
- Ensure the code changes are correctly linted by running eslint using the configuration in the plugin-hrm-form directory