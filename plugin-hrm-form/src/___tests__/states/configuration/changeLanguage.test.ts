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

import { Manager, Notifications } from '@twilio/flex-ui';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import { DefinitionVersion, loadDefinition } from 'hrm-form-definitions';
import { LocalizationType } from '@twilio/flex-ui/src/localization/LocaleManager/LocaleManager.definitions';
import { AvailableLocale } from '@twilio/flex-ui/src/localization/locale.definitions';

import { ConfigurationState, initialState } from '../../../states/configuration/reducer';
import {
  changeLanguageReducer,
  newChangeLanguageAsyncAction,
  REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID,
} from '../../../states/configuration/changeLanguage';
import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';

jest.mock('@twilio/flex-ui', () => ({
  Notifications: {
    showNotification: jest.fn(),
    dismissNotificationById: jest.fn(),
  },
  Manager: {
    getInstance: jest.fn(),
  },
}));

const mockShowNotification = Notifications.showNotification as jest.MockedFunction<
  typeof Notifications.showNotification
>;
const mockDismissNotificationById = Notifications.dismissNotificationById as jest.MockedFunction<
  typeof Notifications.dismissNotificationById
>;
const mockManagerGetInstance = Manager.getInstance as jest.MockedFunction<typeof Manager.getInstance>;
Storage.prototype.setItem = jest.fn();
const mockLocalStorageSetItem = global.localStorage.setItem as jest.MockedFunction<typeof global.localStorage.setItem>;
const { mockFetchImplementation, buildBaseURL } = mockLocalFetchDefinitions();
const mockSetLocalePreference: LocalizationType['setLocalePreference'] = jest.fn() as jest.MockedFunction<
  LocalizationType['setLocalePreference']
>;

const boundChangeLanguageReducer = changeLanguageReducer(initialState);

const testStore = (stateChanges: ConfigurationState) =>
  configureStore({
    preloadedState: { ...initialState, ...stateChanges },
    reducer: boundChangeLanguageReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

let mockV1: DefinitionVersion;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL('v1');
  await mockFetchImplementation(formDefinitionsBaseUrl);
  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
});

beforeEach(() => {
  mockLocalStorageSetItem.mockReset();
  mockDismissNotificationById.mockReset();
  mockShowNotification.mockReset();
  mockManagerGetInstance.mockReset();
  mockManagerGetInstance.mockReturnValue({
    localization: {
      availableLocales: [{ tag: 'en-US' } as AvailableLocale, { tag: 'fr-FR' } as AvailableLocale],
      setLocalePreference: mockSetLocalePreference,
    } as LocalizationType,
  } as Manager);
});

describe('newChangeLanguageAsyncAction', () => {
  test('specify flex locale that exists - sets flex locale to flex locale and adds aselo locale to local storage', async () => {
    const { dispatch, getState } = testStore(initialState);

    const actionPromiseResult = (dispatch(
      newChangeLanguageAsyncAction('fr-CA', {
        ...mockV1,
        flexUiLocales: [
          {
            aseloLocale: 'fr-CA',
            flexLocale: 'fr-FR',
            label: 'Francais (FR)',
            shortLabel: 'FR',
          },
        ],
      }),
    ) as unknown) as Promise<void>;

    expect(getState()).toStrictEqual({
      ...initialState,
      locale: {
        ...initialState.locale,
        status: 'loading',
      },
    });
    await actionPromiseResult;
    expect(getState()).toStrictEqual({
      ...initialState,
      locale: {
        selected: 'fr-CA',
        status: 'loaded',
      },
    });
    expect(mockLocalStorageSetItem).toHaveBeenCalledWith('ASELO_PLUGIN_USER_LOCALE', 'fr-CA');
    expect(mockSetLocalePreference).toHaveBeenCalledWith('fr-FR');
    expect(mockDismissNotificationById).toHaveBeenCalledWith(
      REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID,
    );
    expect(mockShowNotification).toHaveBeenCalledWith(REFRESH_BROWSER_REQUIRED_FOR_LANGUAGE_CHANGE_NOTIFICATION_ID, {
      localeSelection: 'Francais (FR)',
    });
  });
});
