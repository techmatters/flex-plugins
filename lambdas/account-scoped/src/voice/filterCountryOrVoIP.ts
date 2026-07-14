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

import type { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newErr, newOk } from '../Result';
import type { AccountScopedHandler, HttpRequest } from '../httpTypes';

const BLOCKED_CARRIERS = ['HD Carrier LLC'];

export const filterCountryOrVoIPHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  const { from } = body;

  if (!from) {
    return newErr({
      message: 'from parameter is missing',
      error: { statusCode: 400 },
    });
  }

  console.debug('filterCountryOrVoIP: Performing lookup', { accountSid, from });
  const client = await getTwilioClient(accountSid);
  const data = await client.lookups.v2
    .phoneNumbers(from)
    .fetch({ fields: 'sms_pumping_risk,line_type_intelligence' });

  console.debug('filterCountryOrVoIP: Country code', {
    accountSid,
    from,
    countryCode: data?.countryCode,
  });

  if (data?.countryCode !== 'US') {
    console.info('filterCountryOrVoIP: Blocking call from non-US country', {
      accountSid,
      from,
      countryCode: data?.countryCode,
    });
    return newOk({ blockIncoming: true });
  }

  console.debug('filterCountryOrVoIP: Line type intelligence', {
    accountSid,
    from,
    lineTypeIntelligence: data?.lineTypeIntelligence,
  });

  if (data?.lineTypeIntelligence?.type) {
    const lineType = (data.lineTypeIntelligence.type as string).toLowerCase();
    const carrier = data.lineTypeIntelligence.carrier_name as string;

    if (lineType.includes('voip')) {
      console.info('filterCountryOrVoIP: Blocking VoIP call', {
        accountSid,
        from,
        lineType,
      });
      return newOk({ blockIncoming: true });
    }

    if (BLOCKED_CARRIERS.includes(carrier)) {
      console.info('filterCountryOrVoIP: Blocking call from blocked carrier', {
        accountSid,
        from,
        carrier,
      });
      return newOk({ blockIncoming: true });
    }
  }

  console.debug('filterCountryOrVoIP: Allowing call', { accountSid, from });
  return newOk({ blockIncoming: false });
};
