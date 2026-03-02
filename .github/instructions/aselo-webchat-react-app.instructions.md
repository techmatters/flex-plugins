---
applyTo: "aselo-webchat-react-app/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- Ensure the necessary dependencies are properly installed running `npm ci` in aselo-webchat-react-app/
- Ensure the typescript compiles by running the `npm run build` command present aselo-webchat-react-app/package.json
- Ensure the unit tests pass by running the `npm run test` script present in aselo-webchat-react-app/package.json
  - DO NOT run the e2e (end to end) tests.
- Ensure the code changes are correctly linted by running `npm run lint` using the configuration in the aselo-webchat-react-app directory
