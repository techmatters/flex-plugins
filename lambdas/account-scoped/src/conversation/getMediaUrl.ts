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

import { FlexValidatedHandler } from '../validation/flexToken';
import type { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk } from '../Result';
import { getAccountAuthToken } from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';

const TWILIO_MCS_BASE_URL = 'https://mcs.us1.twilio.com/v1/Services';

export const getMediaUrlHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { serviceSid, mediaSid } = event as { serviceSid?: string; mediaSid?: string };

  if (!serviceSid) return newMissingParameterResult('serviceSid');
  if (!mediaSid) return newMissingParameterResult('mediaSid');

  try {
    const authToken = await getAccountAuthToken(accountSid);
    const url = `${TWILIO_MCS_BASE_URL}/${serviceSid}/Media/${mediaSid}`;
    const base64Credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
      'base64',
    );

    const responseData = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64Credentials}`,
      },
    });

    const media = (await responseData.json()) as {
      status?: number;
      links?: { content_direct_temporary?: string };
    };

    if (!responseData.ok) {
      return newErr({
        message: `Failed to fetch media URL: ${responseData.statusText}`,
        error: { statusCode: media.status ?? responseData.status },
      });
    }

    return newOk(media.links?.content_direct_temporary);
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
