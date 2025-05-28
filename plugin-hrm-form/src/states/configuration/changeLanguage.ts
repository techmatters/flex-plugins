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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';
import { Notifications, Manager } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import { ConfigurationState } from './reducer';

export const REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID = 'RefreshBrowserRequiredForLanguageChange';

export const CHANGE_LANGUAGE_ACTION: string = 'configuration-action/change-language';

export const newChangeLanguageAsyncAction = createAsyncAction(
  CHANGE_LANGUAGE_ACTION,
  async (selectedLocale: string, { flexUiLocales }: DefinitionVersion): Promise<{ selectedLocale: string }> => {
    localStorage.setItem('ASELO_PLUGIN_USER_LOCALE', selectedLocale);
    const manager = Manager.getInstance();
    const { availableLocales } = manager.localization;
    const selectedLocaleEntry = flexUiLocales.find(locale => locale.aseloLocale === selectedLocale);
    const specifiedFlexLocale = selectedLocaleEntry?.flexLocale;
    if (specifiedFlexLocale) {
      if (availableLocales.find(locale => locale.tag === selectedLocale)) {
        await manager.localization.setLocalePreference(specifiedFlexLocale);
      } else {
        console.warn(
          `The configured Flex Locale '${specifiedFlexLocale}' for Aselo Locale '${selectedLocale}' is not supported in this version of Flex UI. Attempting to find a best match from available locales`,
        );
      }
    } else {
      const exactMatch = availableLocales.find(({ tag }) => tag === selectedLocale)?.tag;
      if (exactMatch) {
        console.info(
          `Aselo Locale '${selectedLocale}' is also a supported Flex Locale, setting Flex Locale to '${selectedLocale}'`,
        );
        await manager.localization.setLocalePreference(exactMatch);
      } else {
        const [selectedLanguage] = selectedLocale.split('-');
        const languageMatch = availableLocales.find(l => {
          const [availableLocaleLanguage] = l.tag.split('-');
          return availableLocaleLanguage === selectedLanguage;
        })?.tag;
        if (languageMatch) {
          console.info(
            `Aselo Locale '${selectedLocale}' is not supported, but a locale with the same language, '${languageMatch}' is supported, so using that`,
          );
          await manager.localization.setLocalePreference(languageMatch);
        } else {
          console.info(
            `Aselo Locale '${selectedLocale}' is not supported, nor are any with the same language, falling back to global default (en-US)`,
          );
          await manager.localization.setLocalePreference('en-US');
        }
      }
    }
    Notifications.dismissNotificationById(REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID);
    Notifications.showNotification(REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID, {
      localeSelection: selectedLocaleEntry.label,
    });
    return {
      selectedLocale,
    };
  },
);

export const changeLanguageReducer = (initialState: ConfigurationState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newChangeLanguageAsyncAction.pending,
      (state): ConfigurationState => {
        return {
          ...state,
          locale: {
            ...state.locale,
            status: 'loading',
          },
        };
      },
    ),
    handleAction(
      newChangeLanguageAsyncAction.fulfilled,
      (state, { payload: { selectedLocale } }): ConfigurationState => {
        return {
          ...state,
          locale: {
            selected: selectedLocale,
            status: 'loaded',
          },
        };
      },
    ),
    handleAction(
      newChangeLanguageAsyncAction.rejected,
      (state): ConfigurationState => {
        return {
          ...state,
          locale: {
            ...state.locale,
            status: 'loaded',
          },
        };
      },
    ),
  ]);
