# E2E Tests

These end-to-end tests are written using the Playwright testing framework (https://playwright.dev/).

## To run the tests

Make sure you have playwright installed, if not you can install it like `npx playwright install`.

1. There are two approaches when using environmental variables:

- Option 1. Ensure that your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environmental variables are set in env vars in the bash command. `LOAD_SSM_CONFIG` will run any environment with the correct helpline account (`HL_ENV` and `HL`) and respective okta username. Be sure that the .env file does not have any variables set.

- Option 2. Set required environment variables specific to a helpline and okta username (see 'Environment Variable Reference' below').
  This can be done either by attaching the env vars in the bash command to run the tests (step 3) or setting them in a `.env` file in the root of this folder.

2. Run the plugin in the dev server (i.e. `npm run dev` from `../plugin-hrm-form/`).
3. Run `npx playwright test` for headless tests or `npx playwright test --headed` to see the browser sessions (`ENV_VAR_1=xxxxxxxxx <...more env vars...> npx playwright test` if you are setting env vars in the command).

### Running a single test file

Same as above but with the test filename at the end, e.g.

```shell
npx playwright test --headed webchat.spec.ts
```

## Environment Variable Reference

| env                      | value                                                                                      | comment                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| PLAYWRIGHT_USER_USERNAME | a valid e2e dev account okta user                                                          |                                                                   |
| PLAYWRIGHT_USER_PASSWORD | password for PLAYWRIGHT_USER_USERNAME                                                      |                                                                   |
| PLAYWRIGHT_BASEURL       | URL where the flex plugin you are testing is running, defaults to 'https://localhost:3000' |                                                                   |
| TWILIO_ACCOUNT_SID       | E2E twilio account SID                                                                     |                                                                   |
| TWILIO_AUTH_TOKEN        | E2E twilio auth token                                                                      |                                                                   |
| LOAD_SSM_CONFIG          | true                                                                                       | loads each helpline's respective variables based on HL and HL_ENV |
| DEBUG                    | pw:api                                                                                     | optional, but recommended for useable log output                  |

- See `config.ts` for more comprehensive uses of other variables.

### Requirements

See: [top level readme](../README.md)

### NVM (install/use)

Use nvm to ensure we use the same node/npm versions for each product. The first time you setup this repo (or if `nvm use` throws a missing version error), run `nvm install` to install the version of node specified in `.nvmrc`. Then run `nvm use` to switch to that version in the future. Without NVM: YMMV. `nvm-windows` does not support `.nvmrc`. Windows instructions are coming soon!

## Run E2E Tests Locally Against Remote Services

The most common way to run the e2e tests is against remote services. There are two ways to do this. The most commonly run tests should have entries in the `package.json` file's `scripts` section. To run these tests, you can do the following:

1. Ensure your AWS credentials are set up as ENV variables.
2. Run the e2e tests with `npm run test:staging:ca`.

You can look at the `scripts` section of the `package.json` file to see the other tests that are available.

If you want to run a test that is not in the `scripts` section, you can do the following:

1. Ensure your AWS credentials are set up as ENV variables.
2. Run the e2e tests with `LOAD_SSM_CONFIG=true HL=ca HL_ENV=staging npm run test`.

## Run E2E Tests Locally Against Local Services

Sometimes you may want to run the e2e tests against local services instead of remote services. This process is used less often, so may be less likely to be up to date. To do this, you will need to do the following:

1. Start local hrm-service by following the instructions in the hrm repo's readme.md file.
2. Start local serverless using .env vars for the `End to End Testing` twilio account.
3. Start plugin-hrm-form by following the instructions in the [readme](../plugin-hrm-form/README.md).
4. Ensure your AWS credentials are set up as ENV variables.
5. Run the e2e tests with `npm run test:local`.

## Test Lambda Docker Image Locally

To test the lambda docker image locally, you can use the following commands:

build the image:

```shell
npm run docker:build
```

run the image:

```shell
npm run docker:run
```

send a test request to the image:

```shell
npm run docker:sendEvent
```

## TODO

- Currently the tests rely on a plugin dev server being run separately. There should be a single task that manages starting the dev server, running the tests, then shutting down the dev server
- Only one E2E test can be run at a time. Because they run from a single user account, multiple tests in the same run cannot be run in parallel, nor can multiple test runs be executed at the same time. This is clearly a problem for scale & stability in the future.
