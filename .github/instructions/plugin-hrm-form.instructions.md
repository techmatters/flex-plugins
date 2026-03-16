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
2. Create a secret.js file under plugin-hrm-form/src/private with the following contents:
```
/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

export const datadogAccessToken = 'x';
export const datadogApplicationID = 'x';
export const fullStoryId = 'x';
export const versionId = 'local';
export const githubSha = null;
```
3. Run `npm run dev` from plugin-hrm-form
4. To login run the oktaSsoLoginViaApi function under in e2e-tests/okta/ssoLogin.ts. You should pass in the parameters from variables set in the chrome devtools MCP environment, SITE_PASS for password, SITE_USER for username, SITE_ACCOUNT_SID for accountSid and 'https://localhost:3000' as the homeUrl