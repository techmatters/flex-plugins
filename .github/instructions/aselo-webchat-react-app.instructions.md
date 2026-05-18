---
applyTo: "aselo-webchat-react-app/**"
excludeAgent: "code-review"
---

Always run the following checks and fix any issues they raise prior to requesting a review:

- This should not be needed, as dependencies are configured before agent runs, but if dependencies are missing, they should be installed via `npm ci` in aselo-webchat-react-app/.
- Ensure the typescript compiles by running the `npm run build` command present aselo-webchat-react-app/package.json
- Ensure the code changes are correctly linted by running `npm run lint` using the configuration in the aselo-webchat-react-app directory
- Ensure the unit tests pass by running the `npm run test` script present in aselo-webchat-react-app/package.json
  - DO NOT run the e2e (end to end) tests.

When debugging Aselo Webchat, you can use the version deployed for the AS development account unless instructed otherwise. The URL is https://assets-development.tl.techmatters.org/aselo-webchat-react-app/as/