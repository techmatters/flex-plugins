/**
 * Copyright (c) 2023 Twilio Inc. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory.
 */
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Logger, LogLevelDesc } from 'loglevel';

import { store } from './store/store';
import { WebchatWidget } from './components/WebchatWidget';
import { initConfigThunk } from './store/actions/initActions';
import { ConfigState } from './store/definitions';
import { initLogger, getLogger } from './logger';

const initWebchat = async (configLocation?: URL, overrides: Partial<ConfigState> = {}) => {
  const logger = window.Twilio.getLogger(`InitWebChat`);
  const configUrl = configLocation || process.env.REACT_APP_CONFIG_URL || './config.json';

  await store.dispatch(initConfigThunk({ configUrl, overrides }) as any);

  const rootElement = document.getElementById('aselo-webchat-widget-root');
  logger.info('Now rendering the webchat');

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
      initWebchat: typeof initWebchat;
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
