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

      const deploymentKey = 'CV000000';
      await initWebchat(undefined, { deploymentKey });

      expect(initConfigSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          overrides: expect.objectContaining({ deploymentKey }),
        }),
      );
      expect(renderSpy).toHaveBeenCalledWith(
        <Provider store={store}>
          <WebchatWidget />
        </Provider>,
        expect.any(HTMLElement),
      );
    });
  });
});
