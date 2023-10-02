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

import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime";
import * as Flex from "@twilio/flex-ui";
import "./index.css";
import App from "./App";
import { compose, configureStore } from '@reduxjs/toolkit'

const defaultHelplineCode = 'as';

const mountNode = document.getElementById("root");

let accountSid;

const getSubdomain = () => {
  const { hostname } = window.location;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  return defaultHelplineCode;
}

const getConfig = async () => {
  const subdomain = getSubdomain();
  // dynamically fetch config from file in assets/configs/${subdomain}.js
  try {
    const config = await fetch(`/assets/configs/${subdomain}.json`)

    if (config.status === 200) {
      return config.json();
    }
  } catch (e) {
    console.error(`Failed to load config for subdomain ${subdomain}`, e);
  }

  // TODO: this should probably throw an error instead of a default in staging/production
  return (await fetch(`/assets/configs/${defaultHelplineCode}.json`)).json();
}

window.onload = async () => {
  /**
   * In this POC, I demo a pattern of dynamically loading config from a file based on
   * on the subdomain of the current URL. This would allow us to deploy a single
   * instance of this app to a cloudfront distribution fronted s3 bucket with a
   * wildcard subdomain for each environment so that we can have a single entrypoint
   * that can be used by multiple helplines.
   *
   * ex:
   * ca.aselo.com or similar would load production ca config.
   * as.staging.flex.tl.techmatters.org would load staging as config.
   * as.development.flex.tl.techmatters.org would load development as config.
   *
   * We could do all kinds of interesting dynamic things with this pattern like
   * dynamic development deployments, accepting a query param to override the
   * versions of flex plugins to load, etc.
   */
  const config = await getConfig();
  accountSid = config.accountSid;

  const appConfig = {
    ...config.appConfig,
    // router: {
    //   /**
    //    * This can be set to either "browser" or "memory".
    //    *
    //    * "browser" is the default and uses paths in the url to manage routing, but we
    //    * don't have control over the base URL, so, in our demo app, we can't use it
    //    * very effectively.
    //    *
    //    * In a production app, we would need to deploy this app to a root bucket in S3
    //    * so that we could add index handler to make refresh work. So this won't matter.
    //    */
    //   type: 'memory',
    // }
  };

  /**
   * I couldn't get this working in a short time frame, so I'm leaving it commented out for now.
   *
   * We *should* be able to override the default Flex redux store to add our own middleware and/or enhancers.
   *
   */
  const store = configureStore(
    {
     reducer: {
      flex : Flex.FlexReducer,
     },
     middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(Flex.getFlexMiddleware()),
     enhancers: [Flex.flexStoreEnhancer]
    },
  );

  Flex
    .progress(mountNode)
    .provideLoginInfo(appConfig, mountNode)
    .then(() => Flex.Manager.create(
      appConfig,
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

/**
 * I thought this was a a twilio requirement, but twilio hosted doesn't run a service worker, so I guess not
 */
// registerServiceWorker();
