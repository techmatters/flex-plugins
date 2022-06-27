# E2E Tests
These end-to-end tests are a Proof of Concept written using the Playwright testing framework (https://playwright.dev/).

## To run the tests

1. Set any required environment variables (see 'Environment Variable Reference' below')
2. Run the plugin in the dev server (i.e. `npm run start` from `../plugin-hrm-form/`)
3. run `npx playwright test` for headless tests or `npx playwright test --headed` to see the browser sessions

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

## TODO
* Currently the tests rely on a plugin dev server being run separately. There should be a single task that manages starting the dev server, running the tests, then shutting down the dev server
* Only one E2E test can be run at a time. Because they run from a single user account, multiple tests in the same run cannot be run in parallel, nor can multiple test runs be executed at the same time. This is clearly a problem for scale & stability in the future.