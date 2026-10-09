# AGENTS.md — plugin-hrm-form

See also the [root AGENTS.md](../AGENTS.md).

Run all commands below from `plugin-hrm-form/`.

## Validation before requesting a PR review

Before opening a PR or requesting a review, run these checks and fix anything they raise.
There is no need to run them after every individual edit.

- `npx tsc --noEmit` — TypeScript must compile
- `npm test` — unit tests must pass
- `npm run lint` — ESLint (using this directory's config) must be clean
  (`npm run lint:fix` to auto-fix)

## Running the Flex site locally

Use this when you need to debug the UI in a browser.

1. Create `public/appConfig.js` from `public/appConfig.template.e2e.js`, replacing the
   three placeholder values at the top with values from environment variables:
   - `__TWILIO_ACCOUNT_SID__` → `SITE_ACCOUNT_SID`
   - `__TWILIO_CONNECTION__` → `SITE_CONNECTION_SID`
   - `__TWILIO_CLIENT_ID__` → `SITE_CLIENT_ID`
2. Create `src/private/secret.js` with dummy values (the licence header is required):

   ```js
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

   Both files are git-ignored; never commit them.
3. Run `npm run dev`. The site is served at https://localhost:3000.
4. To log in, call `oktaSsoLoginViaApi` from `../e2e-tests/okta/ssoLogin.ts` with
   username `SITE_USER`, password `SITE_PASS`, account SID `SITE_ACCOUNT_SID` (all from
   environment variables) and `'https://localhost:3000'` as the home URL.
