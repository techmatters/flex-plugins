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

import { Manager } from '@twilio/flex-webchat-ui';

import { Configuration, OperatingHoursResponse } from '../types';
import { setFormDefinition } from './pre-engagement-form/state';
import { config } from "./config";

const getOperatingHours = async (language: string): Promise<OperatingHoursResponse> => {
  const body = {
    channel: 'webchat',
    includeMessageTextInResponse: 'true',
    language,
  };

  const options = {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };

  const { SERVERLESS_URL } = require('../private/secret'); // eslint-disable-line global-require
  const response = await fetch(`${config.twilioServicesUrl ?? SERVERLESS_URL}/operatingHours`, options);

  if (response.status === 403) {
    throw new Error('Server responded with 403 status (Forbidden)');
  }

  const responseJson = await response.json();

  if (!response.ok) {
    const option = responseJson.stack ? { cause: responseJson.stack } : null;
    console.log('Error:', option);
    throw new Error(responseJson.message);
  }

  return responseJson;
};

export const displayOperatingHours = async (
  config: Configuration,
  manager: Manager,
  externalWebChatLanguage?: string | null,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  // If a helpline has operating hours configuration set, the pre engagement config will show alternative canvas during closed or holiday times/days
  if (config.checkOpenHours) {
    try {
      const operatingState = await getOperatingHours(externalWebChatLanguage || config.defaultLanguage);
      /*
       * Support legacy function to avoid braking changes
       * TODO: remove once every account has been migrated
       */
      const isClosed =
        operatingState === 'closed' || (typeof operatingState !== 'string' && operatingState.status === 'closed');
      const isHoliday =
        operatingState === 'holiday' || (typeof operatingState !== 'string' && operatingState.status === 'holiday');

      const shouldUpdateForm = isClosed || isHoliday;

      if (shouldUpdateForm) {
        const formToUse = isClosed ? config.closedHours : config.holidayHours;

        if (formToUse) {
          const description = (typeof operatingState !== 'string' && operatingState.message) || formToUse.description;
          const formDefinition = {
            ...formToUse,
            description,
          };

          manager.store.dispatch(setFormDefinition(formDefinition));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};
