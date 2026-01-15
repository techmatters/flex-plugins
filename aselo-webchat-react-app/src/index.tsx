/**
 * Copyright (c) 2023 Twilio Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory.
 */
import merge from "lodash.merge";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Logger, LogLevelDesc } from "loglevel";

import { store } from "./store/store";
import { WebchatWidget } from "./components/WebchatWidget";
import { sessionDataHandler } from "./sessionDataHandler";
import { initConfig } from "./store/actions/initActions";
import { ConfigState } from "./store/definitions";
import { initLogger, getLogger } from "./logger";
import { changeExpandedStatus } from "./store/actions/genericActions";

const defaultConfig: ConfigState = {
    deploymentKey: "",
    region: "",
    alwaysOpen: false,
    theme: {
        isLight: true,
    },
    translations: {},
    defaultLocale: "en-US",
};

const initWebchat = async (configLocation?: URL, overrides: Partial<ConfigState> = {}) => {
    const logger = window.Twilio.getLogger(`InitWebChat`);
    const configUrl = configLocation || process.env.REACT_APP_CONFIG_URL || "./config.json";
    const helplineConfigResponse = await fetch(configUrl);
    if (!helplineConfigResponse.ok) {
        logger.error(`Failed to load helpline specific config for Aselo Webchat from ${configLocation}, aborting load`);
        return;
    }
    const webchatConfig: ConfigState = merge({}, defaultConfig, await helplineConfigResponse.json(), overrides);
    webchatConfig.currentLocale = webchatConfig.defaultLocale;
    if (!webchatConfig || !webchatConfig.deploymentKey) {
        logger.error(`deploymentKey must exist to connect to Webchat servers`);
        return;
    }

    store.dispatch(changeExpandedStatus({ expanded: Boolean(webchatConfig.alwaysOpen) }));

    sessionDataHandler.setRegion(webchatConfig.region);
    sessionDataHandler.setDeploymentKey(webchatConfig.deploymentKey);

    store.dispatch(initConfig(webchatConfig));

    const rootElement = document.getElementById("aselo-webchat-widget-root");
    logger.info("Now rendering the webchat");

    render(
        <Provider store={store}>
            <WebchatWidget />
        </Provider>,
        rootElement,
    );

    if (window.Cypress) {
        window.store = store;
    }
};

declare global {
    interface Window {
        Twilio: {
            initWebchat: (url?: URL, config?: Partial<ConfigState>) => void;
            initLogger: (level?: LogLevelDesc) => void;
            getLogger: (className: string) => Logger;
        };
        Cypress: Cypress.Cypress;
        store: typeof store;
    }
}

// Expose `initWebchat` function to window object
Object.assign(window, {
    Twilio: {
        initWebchat,
        initLogger,
        getLogger,
    },
});
