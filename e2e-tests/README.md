# E2E Tests
These end-to-end tests are a Proof of Concept written using the Playwright testing framework (https://playwright.dev/).

## To run the tests
Make sure you have playwright installed, if not you can install it like `npx playwright install`.

1. Set any required environment variables (see 'Environment Variable Reference' below').
This can be done either by attaching the env vars in the bash command to run the tests (step 3) or setting them in a `.env` file in the root of this folder.
2. Run the plugin in the dev server (i.e. `npm run dev` from `../plugin-hrm-form/`).
3. Run `npx playwright test` for headless tests or `npx playwright test --headed` to see the browser sessions (`ENV_VAR_1=xxxxxxxxx <...more env vars...> npx playwright test` if you are setting env vars in the command).

### Running a single test file

Same as above but with the test filename at the end, e.g.
```shell
npx playwright test --headed webchat.spec.ts
```

## Environment Variable Reference

| env | value | comment |
|--------------------------|----------------------------|---|
| PLAYWRIGHT_USER_USERNAME | a valid e2e dev account okta user | |
| PLAYWRIGHT_USER_PASSWORD | password for PLAYWRIGHT_USER_USERNAME | |
| PLAYWRIGHT_BASEURL | URL where the flex plugin you are testing is running, defaults to 'https://localhost:3000' | |
| TWILIO_ACCOUNT_SID       | E2E twilio account SID | |
| TWILIO_AUTH_TOKEN        | E2E twilio auth token | |
| DEBUG                    | pw:api | optional, but recommended for useable log output |

### Requirements

See: [top level readme](../README.md)

### NVM (install/use)

Use nvm to ensure we use the same node/npm versions for each product. The first time you setup this repo (or if `nvm use` throws a missing version error), run `nvm install` to install the version of node specified in `.nvmrc`. Then run `nvm use` to switch to that version in the future. Without NVM: YMMV. `nvm-windows` does not support `.nvmrc`. Windows instructions are coming soon!

## Run local e2e Tests

1. Start local hrm-service by following the instructions in the hrm repo's readme.md file.
2. Start plugin-hrm-form by following the instructions in the [readme](../plugin-hrm-form/README.md).
3. Run the e2e tests with `npm run test:local`

## TODO
* Currently the tests rely on a plugin dev server being run separately. There should be a single task that manages starting the dev server, running the tests, then shutting down the dev server
* Only one E2E test can be run at a time. Because they run from a single user account, multiple tests in the same run cannot be run in parallel, nor can multiple test runs be executed at the same time. This is clearly a problem for scale & stability in the future.