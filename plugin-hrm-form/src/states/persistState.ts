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

import { Manager } from '@twilio/flex-ui';
import _ from 'lodash';

import { RootState } from '.';
import { namespace } from './storeNamespaces';
import { getAseloFeatureFlags, pluginVersionDescription } from '../hrmConfig';

// Quick & dirty module to persist redux state to localStorage via subscriptions since we can't add middleware like redux-persist to do it for us
export const activateStatePersistence = () => {
  if (getAseloFeatureFlags().enable_local_redux_persist) {
    const debouncedWrite = _.debounce(() => {
      // Exclude configuration from persisted state, since it contains non serializable elements, and is read only in the client anyway
      const {
        [namespace]: { configuration, ...persistableState },
      } = Manager.getInstance().store.getState() as RootState;
      sessionStorage.setItem(
        'redux-state/plugin-hrm-form',
        JSON.stringify({ [pluginVersionDescription]: persistableState }),
      );
    }, 1000);
    Manager.getInstance().store.subscribe(debouncedWrite);
  }
};

export const readPersistedState = (): RootState[typeof namespace] | null => {
  if (getAseloFeatureFlags().enable_local_redux_persist) {
    const persistedStateJson = sessionStorage.getItem('redux-state/plugin-hrm-form');
    if (persistedStateJson) {
      const persistedState = JSON.parse(persistedStateJson);
      return persistedState[pluginVersionDescription];
    }
  }
  return undefined;
};
