[![Actions Status](https://github.com/tech-matters/flex-plugins/workflows/Run%20plugin-hrm-form%20CI/badge.svg)](https://github.com/tech-matters/flex-plugins/actions)
# Your custom Twilio Flex Plugin

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

## Setup

### Requirements

See: [top level readme](../README.md)

[twilio-cli](https://www.twilio.com/docs/twilio-cli/quickstart)
twilio-cli:plugin-flex `twilio plugins:install @twilio-labs/plugin-flex`

### NVM (install/use)

Use nvm to ensure we use the same node/npm versions for each product. The first time you setup this repo (or if `nvm use` throws a missing version error), run `nvm install` to install the version of node specified in `.nvmrc`. Then run `nvm use` to switch to that version in the future. Without NVM: YMMV. `nvm-windows` does not support `.nvmrc`. Windows instructions are coming soon!

### NPM install

Install the dependencies by running:

```bash
npm install
```

### Secrets/Configuration download

Download the files required to run locally by running (this requires docker and valid AWS IAM tokens):

```bash
npm run ssm:local
```

If you are going to run e2e tests, use:

```bash
npm run ssm:local:e2e
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running:

```bash
npm dev:local
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

```bash
PORT=3001 npm dev:local
```

When you make changes to your code, the browser window will be automatically refreshed.

### Run against the local docker hrm-services

```bash
npm run dev:local:docker
```

### Running insights proxy locally

Insights requires a local proxy. To run the proxy, in a separate terminal session run:

```bash
npm run proxy
```

## Testing

In order to test locally, you will need to run:

```bash
npm run test:jest
```
You don't need to worry about the path unless there's another test file with the exact same name. To run a specific test spec, you need to run:

```bash
npm run test:jest -- my-test.spec.ts
```

## Deploy

Once you are happy with your plugin, you have to bundle it in order to deploy it to Twilio Flex.

Run the following command to start the bundling:

```bash
npm run build
```

Afterwards, you'll find in your project a `build/` folder that contains a file with the name of your plugin project. For example, `plugin-example.js`. Take this file and upload it into the Assets part of your Twilio Runtime.

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex to provide them globally.
