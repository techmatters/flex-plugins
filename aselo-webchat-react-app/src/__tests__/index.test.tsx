/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Provider } from 'react-redux';
import * as reactDom from 'react-dom';

import '..';
import { sessionDataHandler } from '../sessionDataHandler';
import { WebchatWidget } from '../components/WebchatWidget';
import { store } from '../store/store';
import * as initActions from '../store/actions/initActions';
import * as genericActions from '../store/actions/genericActions';
import WebChatLogger from '../logger';

jest.mock('node-fetch');
jest.mock('react-dom');
jest.mock('../logger');

store.dispatch = jest.fn();

const mockFetch = jest.fn();
const mockLogger = new WebChatLogger('InitWebChat');
describe('Index', () => {
  const { initWebchat } = window.Twilio;
  beforeAll(() => {
    global.fetch = mockFetch;

    Object.defineProperty(window, 'Twilio', {
      value: {
        getLogger() {
          return mockLogger;
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initWebchat', () => {
    it('renders Webchat Lite correctly', async () => {
      const renderSpy = jest.spyOn(reactDom, 'render');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      const root = document.createElement('div');
      root.id = 'aselo-webchat-widget-root';
      document.body.appendChild(root);
      await initWebchat(undefined, { deploymentKey: 'CV000000' });

      expect(renderSpy).toBeCalledWith(
        <Provider store={store}>
          <WebchatWidget />
        </Provider>,
        root,
      );
    });

    it('sets region correctly', async () => {
      const setRegionSpy = jest.spyOn(sessionDataHandler, 'setRegion');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      const region = 'Foo';
      await initWebchat(undefined, { deploymentKey: 'CV000000', region });

      expect(setRegionSpy).toBeCalledWith(region);
    });

    it('sets deployment key correctly', async () => {
      const setDeploymentKeySpy = jest.spyOn(sessionDataHandler, 'setDeploymentKey');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      const deploymentKey = 'Foo';
      await initWebchat(undefined, { deploymentKey });

      expect(setDeploymentKeySpy).toBeCalledWith(deploymentKey);
    });

    it('initializes config', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      await initWebchat(undefined, { deploymentKey: 'CV000000' });

      expect(initConfigSpy).toBeCalled();
    });

    it('initializes config with provided config merged with default config', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      const deploymentKey = 'CV000000';
      await initWebchat(undefined, { deploymentKey });

      expect(initConfigSpy).toBeCalledWith(expect.objectContaining({ deploymentKey }));
    });

    it('gives error when deploymentKey is missing', async () => {
      const logger = window.Twilio.getLogger('InitWebChat');
      const errorLoggerSpy = jest.spyOn(logger, 'error');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      await initWebchat();
      expect(errorLoggerSpy).toBeCalledTimes(1);
      expect(errorLoggerSpy).toHaveBeenCalledWith('deploymentKey must exist to connect to Webchat servers');
    });

    it('triggers expanded true if alwaysOpen is set', async () => {
      const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      await initWebchat(undefined, { deploymentKey: 'CV000000', alwaysOpen: true });
      expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: true });
    });

    it('triggers expanded false if alwaysOpen is not set', async () => {
      const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      await initWebchat(undefined, { deploymentKey: 'CV000000', alwaysOpen: false });
      expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });

      await initWebchat(undefined, { deploymentKey: 'CV000000', alwaysOpen: 'some nonsense' as any });
      expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
    });

    it('triggers expanded false with default appStatus', async () => {
      const changeExpandedStatusSpy = jest.spyOn(genericActions, 'changeExpandedStatus');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      await initWebchat(undefined, { deploymentKey: 'CV000000' });
      expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
    });
  });
});
