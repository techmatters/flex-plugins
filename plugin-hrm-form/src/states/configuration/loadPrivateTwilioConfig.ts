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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { ConfigurationState } from './reducer';
import { getPrivateTwilioConfiguration } from '../../services/configurationService';

const LOAD_PRIVATE_TWILIO_CONFIGURATION: string = 'configuration-action/load-private-twilio-configuration';

type TwilioPrivateConfigurationState = ConfigurationState['twilioPrivateConfiguration'];

export const newLoadPrivateTwilioConfigurationAsyncAction = createAsyncAction(
  LOAD_PRIVATE_TWILIO_CONFIGURATION,
  async (): Promise<TwilioPrivateConfigurationState> => {
    return getPrivateTwilioConfiguration();
  },
);

export const loadPrivateTwilioConfigurationReducer = (initialState: ConfigurationState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newLoadPrivateTwilioConfigurationAsyncAction.fulfilled,
      (state, { payload }): ConfigurationState => {
        return {
          ...state,
          twilioPrivateConfiguration: payload,
        };
      },
    ),
  ]);
