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

import { LocaleString } from './store/definitions';

/**
 * Initialises the Aselo Webchat widget by reading configuration from URL parameters,
 * ensuring the widget root element exists, and calling Twilio.initWebchat.
 *
 * This function is exposed on window.Twilio so it can be called from both the
 * standard app.js bootstrap and the aselo-chat.min.js wrapper used for legacy URL
 * compatibility deploys.
 */
export const initChat = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const theme = urlParams.get('theme');
  const isLightTheme = theme !== 'dark';
  const alwaysOpen = urlParams.get('alwaysOpen');
  const defaultLocale = urlParams.get('locale');
  const configUrl = urlParams.get('configUrl') ?? undefined;

  const themeEl = document.querySelector('[data-theme-pref]');
  themeEl?.setAttribute('data-theme-pref', isLightTheme ? 'light-theme' : 'dark-theme');

  if (!document.getElementById('aselo-webchat-widget-root')) {
    const root = document.createElement('div');
    root.id = 'aselo-webchat-widget-root';
    document.body.appendChild(root);
  }

  window.Twilio.initLogger('info');
  window.Twilio.initWebchat(configUrl, {
    theme: { isLight: isLightTheme },
    ...(alwaysOpen ? { alwaysOpen: alwaysOpen.toLowerCase() === 'true' } : {}),
    ...(defaultLocale ? { defaultLocale: defaultLocale as LocaleString } : {}),
  });
};
