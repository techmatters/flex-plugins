# E2E Test Runner Lambda

This lambda runs the Playwright E2E tests defined in `/e2e-tests` via an AWS Lambda function.

## Overview

The handler spawns `npm run test` (or a custom npm script) in the `/app/e2e-tests` directory
inside the container, then uploads the test artifacts (screenshots, videos, junit results) to S3.

## Event Parameters

| Parameter   | Type   | Required | Description                                                    |
|-------------|--------|----------|----------------------------------------------------------------|
| `testName`  | string | No       | Name of a specific test to run (sets `TEST_NAME` env var)      |
| `npmScript` | string | No       | npm script to run (defaults to `test`)                         |

## Docker

The lambda uses a custom Dockerfile (`Dockerfile`) that is based on the Microsoft Playwright
base image in order to include the Playwright browser dependencies. The E2E test code from
`/e2e-tests` is pulled into the container at build time.

To build the Docker image locally from the repository root:

```bash
cd lambdas/e2eTestRunner
npm run docker:build
```

## Environment Variables

The following environment variables are set in the container:

- `TEST_IN_LAMBDA=true` — indicates the tests are running inside a Lambda
- `XDG_CONFIG_HOME=/tmp/.config` — redirects browser config to writable `/tmp`
- `PLAYWRIGHT_BROWSERS_PATH=/tmp` — redirects Playwright browser binaries to writable `/tmp`
