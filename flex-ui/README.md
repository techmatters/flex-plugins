# POC of self hosted flex-ui

This is a very early POC of self hosted flex-ui for research purposes. This is based on [flex-ui-sample](https://github.com/twilio/flex-ui-sample).

## How to run POC

### Install packages

```
npm ci
```

### Ensure that there is a valid build of the hrm plugin available

```
cd ../plugin-hrm-form && npm run build && cd ../flex-ui
```

### Build and deploy the flex-ui POC along with the hrm plugin

```
npm run build && npm run deploy:development
```

<!-- I thought service workers were required by flex because it was part of the sample, but apparently not. Flex hosted doesn't run a service worker.

 Service worker reloads are complicated. If you want to see the latest version of the app, you'll need to open dev tools, navigate to the application tab, navigate to the Service workers menu and click the skipWaiting button next to the new service worker. Alternatively, you can just use an incognito window that you close/reopen to get the latest version of the app.

There are several strategies for handling service worker reloads in a user friendly way. We'll need to figure out which one works best for us if we go down this path. -->

### Open the POC in a browser

[https://as.development.flex.tl.techmatters.org/](https://as.development.flex.tl.techmatters.org/)

## Key Learnings

- Wildcard domain must be added to SSO whitelist in [flex twilio console](https://console.twilio.com/us1/develop/flex/manage/single-sign-on).

- We can implement our own complex configuration loader.

- We should be able to override the default redux store with our own implementation to add our own middleware, like thunk.

- Must be deployed at a root level and use a custom S3 error handler so that 404s are redirected to index.html so that refresh will work.

- Logout doesn't work in the POC. We'll need to figure out how to intercept a logout event and clear local storage.

- Subdomain separation should allow us to be logged into multiple helplines at the same time. Not really a user facing benefit, but it's a nice to have for dev/QA.

- ~~Service workers and reloads are always a bit of a PITA when it comes to displaying the latest version of the app. We'll need to figure out how to handle this.~~