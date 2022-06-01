# E2E Tests
These end-to-end tests are a Proof of Concept written using the Playwright testing framework (https://playwright.dev/).

## To run the tests

1. Set the following environment variables:

| env | value | comment |
|--------------------------|----------------------------|---|
| PLAYWRIGHT_USER_USERNAME | \<a valid e2e dev account okta user\> | |
| PLAYWRIGHT_USER_PASSWORD | \<password for PLAYWRIGHT_USER_USERNAME\> | |
| TWILIO_ACCOUNT_SID       | E2E twilio account SID | |
| DEBUG                    | pw:api | optional, but recommended for useable log output |

2. Run the plugin in the dev server (i.e. `npm run start` from `../plugin-hrm-form/`)
3. run `npx playwright test` for headless tests or `npx playwright test --headed` to see the browser sessions

### Running a single test file

Same as above but with the test filename at the end, e.g.
```shell
npx playwright test --headed webchat.spec.ts
```


## TODO
* Currently the tests rely on a plugin dev server being run separately. There should be a single task that manages starting the dev server, running the tests, then shutting down the dev server
* There is no dedicated Twilio user account on E2E Dev for tests, you need to use an existing one.
* The tests will get into a bad state if they fail partway through, particularly if they leave a task partially complete. We need code that attempts to 'reset' the state of the worker & tasks so the tests always start in a consistent state - this would ideally be done directly via the Twilio API rather than by pushing buttons in the GUI
* The preflight login step is done using the Okta GUI. We should replace this with API calls to make it faster & more robust - we aren't trying to test Okta's GUI for them!