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

const parseBoolean = (value: string | boolean | null | undefined): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === 'true') {
    return true;
  }
  if (normalizedValue === 'false') {
    return false;
  }

  return undefined;
};

const parseZIndex = (value: string | boolean | null | undefined): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsedZIndex = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsedZIndex) ? parsedZIndex : undefined;
};

const parseString = (value: string | boolean | null | undefined): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

const getOrCreateRootElement = () => {
  let root = document.getElementById('aselo-webchat-widget-root');
  if (root) {
    return root;
  }

  root = document.createElement('div');
  root.id = 'aselo-webchat-widget-root';
  document.body.appendChild(root);
  return root;
};

const createInitOptions = (
  isLightTheme: boolean,
  backgroundColor: string | undefined,
  color: string | undefined,
  widgetAlwaysOpen: boolean | undefined,
  defaultLocale: string | undefined,
  enableMobileOptimizations: boolean | undefined,
) => {
  const initOptions: {
    theme: {
      isLight: boolean;
      overrides: {
        backgroundColors: Record<string, string>;
        textColors: Record<string, string>;
      };
    };
    widgetAlwaysOpen?: boolean;
    defaultLocale?: LocaleString;
    enableMobileOptimizations?: boolean;
  } = {
    theme: {
      isLight: isLightTheme,
      overrides: {
        backgroundColors: {
          ...(backgroundColor && { colorBackgroundPrimary: backgroundColor }),
        },
        textColors: { ...(color && { colorTextWeakest: color }) },
      },
    },
  };

  if (widgetAlwaysOpen !== undefined) {
    initOptions.widgetAlwaysOpen = widgetAlwaysOpen;
  }
  if (defaultLocale) {
    initOptions.defaultLocale = defaultLocale as LocaleString;
  }
  if (enableMobileOptimizations !== undefined) {
    initOptions.enableMobileOptimizations = enableMobileOptimizations;
  }

  return initOptions;
};

/**
 * Initialises the Aselo Webchat widget by reading configuration from URL parameters,
 * ensuring the widget root element exists, and calling Twilio.initWebchat.
 *
 * This function is exposed on window.Twilio so it can be called from both the
 * standard app.js bootstrap and the aselo-chat.min.js wrapper used for legacy URL
 * compatibility deploys.
 */
export const initChat = (scriptTagData: Record<string, string | boolean | undefined>) => {
  const urlParams = new URLSearchParams(window.location.search);
  const theme = urlParams.get('theme') ?? scriptTagData.theme;
  const isLightTheme = theme !== 'dark';
  const color = parseString(urlParams.get('color') || scriptTagData.color);
  const enableMobileOptimizations =
    parseBoolean(urlParams.get('enableMobileOptimizations')) ?? parseBoolean(scriptTagData.enableMobileOptimizations);
  const backgroundColor = parseString(urlParams.get('backgroundColor') || scriptTagData.backgroundColor);
  const widgetAlwaysOpen =
    parseBoolean(urlParams.get('widgetAlwaysOpen')) ?? parseBoolean(scriptTagData.widgetAlwaysOpen);
  const defaultLocale =
    // data-language attribute is supported for backwards compatibility, remove once webchat is fully migrated
    parseString(urlParams.get('locale') || scriptTagData.locale || scriptTagData.language);
  const configUrl = urlParams.get('configUrl') ?? scriptTagData.configUrl?.toString() ?? undefined;
  const zIndex = parseZIndex(urlParams.get('zIndex') ?? urlParams.get('z-index')) ?? parseZIndex(scriptTagData.zIndex);

  const themeEl = document.querySelector('[data-theme-pref]');
  themeEl?.setAttribute('data-theme-pref', isLightTheme ? 'light-theme' : 'dark-theme');
  const root = getOrCreateRootElement();
  if (zIndex !== undefined) {
    root.style.zIndex = String(zIndex);
  }

  window.Twilio.initLogger('info');
  window.Twilio.initWebchat(
    configUrl,
    createInitOptions(isLightTheme, backgroundColor, color, widgetAlwaysOpen, defaultLocale, enableMobileOptimizations),
  );
};
