---
applyTo: "aselo-webchat-react-app/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- Ensure the typescript compiles by running the build command in aselo-webchat-react-app/package.json
- Ensure the unit tests pass by running the test script in aselo-webchat-react-app/package.json
- Ensure the code changes are correctly linted by running eslint using the configuration in the aselo-webchat-react-app directory
