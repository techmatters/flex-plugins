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

import { AccountSID } from '@tech-matters/twilio-types';
import { getSsmParameter, SsmParameterNotFound } from '@tech-matters/ssm-cache';
import { AseloCustomChannel } from './customChannelToFlex';

const LEGACY_FACEBOOK_PAGE_ACCESS_TOKEN_PARAMETERS: Record<AccountSID, string> = {
  ACx: '',
};

export const getFacebookPageAccessToken = async (
  accountSid: AccountSID,
): Promise<string> => {
  try {
    const parameter = await getSsmParameter(
      `/${process.env.NODE_ENV}/twilio/${accountSid}/facebook_page_access_token`,
    );
    return parameter;
  } catch (error) {
    if (error instanceof SsmParameterNotFound) {
      console.warn(
        `New facebook page access token parameter not found for accountSid: ${accountSid}, looking up legacy name.`,
      );
      const legacyParameter = await getSsmParameter(
        LEGACY_FACEBOOK_PAGE_ACCESS_TOKEN_PARAMETERS[accountSid],
      );
      return legacyParameter;
    }
    throw error;
  }
};

export const getFacebookAppSecret = (): Promise<string> =>
  getSsmParameter(`FACEBOOK_APP_SECRET`);

export const getChannelStudioFlowSid = (
  accountSid: AccountSID,
  channelName: AseloCustomChannel,
): Promise<string> =>
  getSsmParameter(
    `/${process.env.NODE_ENV}/twilio/${accountSid}/${channelName}_studio_flow_sid`,
  );
