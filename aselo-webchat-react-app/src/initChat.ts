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

const extractBooleanFromUrlParamOrScriptDataAttributeSet = (
  name: string,
  scriptTagData: Record<string, string | undefined>,
): boolean | undefined => {
  const urlParam = new URLSearchParams(window.location.search).get(name);
  if (urlParam) {
    return Boolean(urlParam.toLowerCase() === 'true');
  }
  const scriptDataAttributeValue = scriptTagData[name];
  if (scriptDataAttributeValue) {
    return Boolean(scriptDataAttributeValue.toLowerCase() === 'true');
  }
  return undefined;
};

/**
 * Initialises the Aselo Webchat widget by reading configuration from URL parameters,
 * ensuring the widget root element exists, and calling Twilio.initWebchat.
 *
 * This function is exposed on window.Twilio so it can be called from both the
 * standard app.js bootstrap and the aselo-chat.min.js wrapper used for legacy URL
 * compatibility deploys.
 */
export const initChat = (scriptTagData: Record<string, string | undefined>) => {
  const urlParams = new URLSearchParams(window.location.search);
  const theme = urlParams.get('theme') ?? scriptTagData.theme;
  const isLightTheme = theme !== 'dark';
  const color = urlParams.get('color') || scriptTagData.color;
  const enableMobileOptimizations = extractBooleanFromUrlParamOrScriptDataAttributeSet(
    'enableMobileOptimizations',
    scriptTagData,
  );
  const backgroundColor = urlParams.get('backgroundColor') || scriptTagData.backgroundColor;
  const widgetAlwaysOpen = extractBooleanFromUrlParamOrScriptDataAttributeSet('widgetAlwaysOpen', scriptTagData);
  const defaultLocale =
    // data-language attribute is supported for backwards compatibility, remove once webchat is fully migrated
    urlParams.get('locale') || scriptTagData.locale || scriptTagData.language;

  const themeEl = document.querySelector('[data-theme-pref]');
  themeEl?.setAttribute('data-theme-pref', isLightTheme ? 'light-theme' : 'dark-theme');
  let root = document.getElementById('aselo-webchat-widget-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'aselo-webchat-widget-root';

    document.body.appendChild(root);
  }
  if (scriptTagData.zIndex !== undefined) {
    const parsedZIndex = Number.parseInt(String(scriptTagData.zIndex).trim(), 10);
    if (Number.isFinite(parsedZIndex)) {
      root.style.zIndex = String(parsedZIndex);
    }
  }

  window.Twilio.initLogger('info');
  window.Twilio.initWebchat(urlParams.get('configUrl'), scriptTagData.configUrl?.toString(), {
    theme: {
      isLight: isLightTheme,
      overrides: {
        backgroundColors: {
          ...(backgroundColor && { colorBackgroundPrimary: backgroundColor }),
        },
        textColors: { ...(color && { colorTextWeakest: color }) },
      },
    },
    ...(widgetAlwaysOpen === undefined ? {} : { widgetAlwaysOpen: widgetAlwaysOpen as boolean }),
    ...(defaultLocale ? { defaultLocale: defaultLocale as LocaleString } : {}),
    ...(enableMobileOptimizations === undefined
      ? {}
      : { enableMobileOptimizations: enableMobileOptimizations as boolean }),
  });
};
