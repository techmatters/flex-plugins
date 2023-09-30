# POC of self hosted flex-ui

This is a very early POC of self hosted flex-ui for research purposes.

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
npm run build && npm run deploy:development:as
```

### Open the POC in a browser

[https://assets-development.tl.techmatters.org/flex/as](https://assets-development.tl.techmatters.org/flex/as)

## Key Learnings

- We can implement our own complex configuration loader.

- We can override the default redux store with our own implementation to add our own middleware, like thunk.

- Must be deployed at a root level and use a custom S3 error handler so that 404s are redirected to index.html so that refresh will work.

- Logout doesn't work in the POC. We'll need to figure out how to intercept a logout event and clear local storage.

- Service workers and reloads are always a bit of a PITA when it comes to displaying the latest version of the app. We'll need to figure out how to handle this.