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
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { getTwilioClient } from '@tech-matters/twilio-configuration';

const LEGACY_FACEBOOK_PAGE_ACCESS_TOKEN_PARAMETERS: Record<
  string,
  Record<string, string>
> = {
  as: {
    development: 'FACEBOOK_PAGE_ACCESS_TOKEN_105220114492262_Aselo-Development',
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_398416306680981_Aselo-Staging',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_105642325869250_Aselo-Prod-Test',
  },
  br: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_106330932198223_SaferNet---Staging',
  },
  co: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_102132102625343_Te-Gu-o---Staging',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_103538615719253_Te-Gu-o---L-nea-de-ayuda',
  },
  jm: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_104423992367481_SafeSpot.Staging---JM',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_107246798170317_Safespot-Ja',
  },
  mt: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_100808575774509_Huerta-Bosque-y-Luna',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_325981127456443_kellimni.com',
  },
  nz: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_453194187877367_NZ-Staging',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_103538615719253_Te-Gu-o---L-nea-de-ayuda',
  },
  th: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_100136349533502_Childline-TH-Staging',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_59591583805_Childline-Thailand-Foundation',
  },
  tz: {
    staging: 'FACEBOOK_PAGE_ACCESS_TOKEN_565233119996327_Aselo-TZ-Staging',
    production: 'FACEBOOK_PAGE_ACCESS_TOKEN_151504668210452_C-Sema',
  },
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
      const { helpline_code: shortCode } = await retrieveServiceConfigurationAttributes(
        await getTwilioClient(accountSid),
      );
      const environment = process.env.NODE_ENV ?? '';
      const legacyParameter = await getSsmParameter(
        LEGACY_FACEBOOK_PAGE_ACCESS_TOKEN_PARAMETERS[shortCode][environment],
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
