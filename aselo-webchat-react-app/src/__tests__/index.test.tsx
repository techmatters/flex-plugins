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
import { WebchatWidget } from '../components/WebchatWidget';
import { store } from '../store/store';
import * as initActions from '../store/actions/initActions';
import WebChatLogger from '../logger';

jest.mock('react-dom');
jest.mock('../logger');

store.dispatch = jest.fn();

const mockFetch = jest.fn();
global.fetch = mockFetch;
const mockLogger = new WebChatLogger('InitWebChat');
describe('Index', () => {
  const { initWebchat } = window.Twilio;
  const originalConfigUrlEnv = process.env.REACT_APP_CONFIG_URL;
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
    process.env.REACT_APP_CONFIG_URL = originalConfigUrlEnv;
  });

  describe('initWebchat', () => {
    it('renders Webchat Lite correctly', async () => {
      const renderSpy = jest.spyOn(reactDom, 'render');
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

      const root = document.createElement('div');
      root.id = 'aselo-webchat-widget-root';
      document.body.appendChild(root);
      await initWebchat(null, undefined, {});

      expect(renderSpy).toHaveBeenCalledWith(
        <Provider store={store}>
          <WebchatWidget />
        </Provider>,
        root,
      );
    });

    it('calls initConfigThunk and renders the app if setup is correct', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      const renderSpy = jest.spyOn(reactDom, 'render');

      await initWebchat(null, undefined, { defaultLocale: 'fr-FR' });

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          overrides: expect.objectContaining({ defaultLocale: 'fr-FR' }),
        }),
      );
      expect(renderSpy).toHaveBeenCalledWith(
        <Provider store={store}>
          <WebchatWidget />
        </Provider>,
        expect.any(HTMLElement),
      );
    });

    it('uses URL config param over environment and document config values', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      process.env.REACT_APP_CONFIG_URL = '/env-config.json';

      await initWebchat('/url-config.json', '/document-config.json', {});

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          configUrl: '/url-config.json',
        }),
      );
    });

    it('uses environment config URL when URL config param is empty', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      process.env.REACT_APP_CONFIG_URL = '/env-config.json';

      await initWebchat('', '/document-config.json', {});

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          configUrl: '/env-config.json',
        }),
      );
    });

    it('uses document config URL when environment config URL is empty', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      process.env.REACT_APP_CONFIG_URL = '';

      await initWebchat(null, '/document-config.json', {});

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          configUrl: '/document-config.json',
        }),
      );
    });

    it('uses default config URL when higher-precedence values are unset', async () => {
      const initConfigSpy = jest.spyOn(initActions, 'initConfigThunk');
      delete process.env.REACT_APP_CONFIG_URL;

      await initWebchat(null, undefined, {});

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          configUrl: './config.json',
        }),
      );
    });
  });
});
