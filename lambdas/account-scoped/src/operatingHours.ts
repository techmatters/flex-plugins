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

import '@twilio-labs/serverless-runtime-types';
import moment from 'moment-timezone';
import { AccountScopedHandler, HttpError } from './httpTypes';
import { AccountSID } from './twilioTypes';
import { newErr, newOk, Result } from './Result';
import { lookupCustomMessage } from './hrm/formDefinitionsCache';
import {
  areOperatingHoursEnforced,
  getOperatingInfoKey,
} from './configuration/twilioConfiguration';

type OperatingShift = { open: number; close: number };

enum DaysOfTheWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

type OfficeOperatingInfo = {
  timezone: string; // the timezone the helpline uses
  holidays: { [date: string]: string }; // a date (in MM/DD/YYYY format) - holiday name object to specify which days are holidays for the helpline
  operatingHours: { [channel: string]: { [day in DaysOfTheWeek]: OperatingShift[] } }; // object that pairs numbers representing weekdays to open and close shifts
};

// The root contains OfficeOperatingInfo info (default, support legacy) plus an "offices" entry, which maps OfficeOperatingInfo to a particular office
type OperatingInfo = OfficeOperatingInfo & {
  offices: {
    [office: string]: OfficeOperatingInfo;
  };
};

export type Body = {
  channel?: string;
  office?: string;
  includeMessageTextInResponse?: string;
  language?: string;
};

const isOpen =
  (timeOfDay: number) =>
  (shift: OperatingShift): boolean =>
    timeOfDay >= shift.open && timeOfDay < shift.close;
const getStatusFromEntry = (
  officeOperatingInfo: OfficeOperatingInfo,
  channel: string,
) => {
  if (!officeOperatingInfo || !officeOperatingInfo.operatingHours[channel]) {
    throw new Error(
      `Operating Info not found for channel ${channel}. Check OPERATING_INFO_KEY env vars and a matching OperatingInfo json file for it.`,
    );
  }

  const { timezone, holidays, operatingHours } = officeOperatingInfo;

  const timeOfDay = parseInt(
    moment().tz(timezone).format('Hmm'), // e.g 123 for 1hs 23m, 1345 for 13hs 45m
    10,
  );
  const dayOfWeek = moment().tz(timezone).isoWeekday() as DaysOfTheWeek;
  const currentDate = moment().tz(timezone).format('MM/DD/YYYY');

  if (currentDate in holidays) {
    return 'holiday';
  }

  const isInOpenShift = isOpen(timeOfDay);
  const isOpenNow = operatingHours[channel][dayOfWeek].some(isInOpenShift);

  if (isOpenNow) {
    return 'open';
  }

  return 'closed';
};

const getOperatingStatus = ({
  channel,
  operatingInfo,
  office,
}: {
  operatingInfo: OperatingInfo;
  channel: string;
  office?: string;
}) => {
  const { offices, ...operatingInfoRoot } = operatingInfo;

  if (office) {
    try {
      const officeEntry = offices[office];

      return getStatusFromEntry(officeEntry, channel);
    } catch (err) {
      console.warn(`Error trying to access entry for office ${office}`, err);
    }
  }

  // If no office was provided, or the channel is missing in the office entry, return root info
  return getStatusFromEntry(operatingInfoRoot, channel);
};

const getClosedMessage = async ({
  accountSid,
  locale = 'en-US',
  status,
}: {
  accountSid: AccountSID;
  status: 'closed' | 'holiday';
  locale: string;
}): Promise<string> => {
  const messageKey = status === 'closed' ? 'ClosedOutOfShift' : 'ClosedHolidays';

  // Try to get the translated message
  try {
    const customMessage = await lookupCustomMessage(accountSid, locale, messageKey);
    if (customMessage) {
      return customMessage;
    }
    // We would typically look up 'standard translations' here, but none are currently set up
    // The message is always set as a custom message for the helpline
    console.info(`No custom ${messageKey} message set for ${locale} on ${accountSid}`);
  } catch {
    console.warn(`Couldn't retrieve EndChatMsg message translation for ${locale}`);
  }

  // Return default strings if can't retrieve the translation
  return {
    ClosedOutOfShift: 'The helpline is out of shift, please reach us later.',
    ClosedHolidays: 'The helpline is closed due to a holiday.',
  }[messageKey];
};

const newOpenResult = () => {
  const response = {
    status: 'open',
    message: undefined,
  };

  return newOk(response);
};

export const handleOperatingHours: AccountScopedHandler = async (
  { body },
  accountSid: AccountSID,
): Promise<Result<HttpError, any>> => {
  try {
    const operatingInfoKey = await getOperatingInfoKey(accountSid);

    const { channel, office, language } = body;

    const enforced = await areOperatingHoursEnforced(accountSid);
    if (!enforced) {
      return newOpenResult();
    }

    if (channel === undefined) {
      return newErr({
        message: 'channel parameter is missing',
        error: { statusCode: 400 },
      });
    }
    let operatingInfo: OperatingInfo;
    try {
      operatingInfo = require(`./operatingInfo/${operatingInfoKey}.json`);
    } catch (err) {
      return newOpenResult();
    }

    const status = getOperatingStatus({ operatingInfo, channel, office });

    // Return the status and, if closed, the appropriate message
    const response = {
      status,
      message:
        status === 'open'
          ? undefined
          : await getClosedMessage({ accountSid, status, locale: language }),
    };

    return newOk(response);
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
