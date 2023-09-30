import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime";
import * as Flex from "@twilio/flex-ui";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { compose, configureStore } from '@reduxjs/toolkit'

const mountNode = document.getElementById("root");

window.onload = () => {
  /**
   * This is the appConfig that we can pass into flex-ui to set helpine info.
   * The important thing to note here is that we could potentially pass in
   * a short code for the helpline to a single flex-ui deployment per env/region,
   * load the configuration dynamically. Flex stores info about the logged in
   * user/account in local storage, so this will persist through the session.
   *
   * We could also dynamically generate the plugin configuration so that we can
   * point various accounts at different verions of the plugin and/or target
   * a different version based on a get query param for dynamic test environments.
   */
  const predefinedConfig = window.appConfig || {};

  const configuration = {
    ...predefinedConfig,
    router: {
      /**
       * This can be set to either "browser" or "memory".
       *
       * "browser" is the default and uses react-router-dom to manage routing, but we
       * don't have control over the base URL, so, in our demo app, we can't use it
       * very effectively.
       *
       * In a production app, we would need to deploy this app to a root bucket in S3
       * so that we could add index handler to make refresh work. So this won't matter.
       */
      type: 'memory',
    }
  };

  /**
   * I couldn't get this working in a short time frame, so I'm leaving it commented out for now.
   *
   * We *should* be able to override the default Flex redux store to add our own middleware and/or enhancers.
   *
   */
  // const store = configureStore(
  //   {
  //    reducer: {
  //     flex : Flex.FlexReducer,
  //    },
  //    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(Flex.getFlexMiddleware()),
  //    enhancers: [Flex.flexStoreEnhancer]
  //   },
  // );

  Flex
    .progress(mountNode)
    .provideLoginInfo(configuration, mountNode)
    .then(() => Flex.Manager.create(
      configuration,
      // store,
    ))
    .then(manager => renderApp(manager))
    .catch(error => handleError(error));
};

function renderApp(manager) {
  ReactDOM.render(
    <App manager={manager} />,
    mountNode
  );
}

function handleError(error) {
  Flex.errorPage(error, mountNode);
  console.error("Failed to initialize Flex", error);
}

registerServiceWorker();
