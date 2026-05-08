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

import { initChat } from '../initChat';

describe('initChat', () => {
  const initLoggerMock = jest.fn();
  const initWebchatMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');

    Object.assign(window, {
      Twilio: {
        initLogger: initLoggerMock,
        initWebchat: initWebchatMock,
      },
    });
  });

  it('prefers zIndex URL parameter over script tag data-z-index', () => {
    window.history.replaceState({}, '', '/?zIndex=999');

    initChat({ zIndex: '111' });

    expect(document.getElementById('aselo-webchat-widget-root')?.style.zIndex).toBe('999');
  });

  it('supports z-index URL parameter', () => {
    window.history.replaceState({}, '', '/?z-index=777');

    initChat({});

    expect(document.getElementById('aselo-webchat-widget-root')?.style.zIndex).toBe('777');
  });

  it('parses z-index input variants safely', () => {
    initChat({ zIndex: 'not-a-number' });
    expect(document.getElementById('aselo-webchat-widget-root')?.style.zIndex).toBe('');

    window.history.replaceState({}, '', '/?zIndex=-12.8');
    initChat({});
    expect(document.getElementById('aselo-webchat-widget-root')?.style.zIndex).toBe('-12');

    window.history.replaceState({}, '', '/?zIndex=%20%2042%20');
    initChat({});
    expect(document.getElementById('aselo-webchat-widget-root')?.style.zIndex).toBe('42');
  });

  it('parses boolean values from script attributes', () => {
    initChat({
      enableMobileOptimizations: 'false',
      widgetAlwaysOpen: 'false',
    });

    const [, initOptions] = initWebchatMock.mock.calls[0];
    expect(initOptions.enableMobileOptimizations).toBe(false);
    expect(initOptions.widgetAlwaysOpen).toBe(false);
  });

  it('parses truthy/falsey boolean option variants and ignores invalid values', () => {
    window.history.replaceState({}, '', '/?enableMobileOptimizations=TRUE&widgetAlwaysOpen=%20False%20');
    initChat({
      enableMobileOptimizations: true,
      widgetAlwaysOpen: true,
    });

    let [, initOptions] = initWebchatMock.mock.calls[0];
    expect(initOptions.enableMobileOptimizations).toBe(true);
    expect(initOptions.widgetAlwaysOpen).toBe(false);

    window.history.replaceState({}, '', '/');
    initChat({
      enableMobileOptimizations: 'invalid',
      widgetAlwaysOpen: 'invalid',
    });

    [, initOptions] = initWebchatMock.mock.calls[1];
    expect(initOptions.enableMobileOptimizations).toBeUndefined();
    expect(initOptions.widgetAlwaysOpen).toBeUndefined();
  });
});
