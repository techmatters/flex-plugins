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

import { getConfigValue } from '../config';
// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';
import VoiceResponse = twilio.twiml.VoiceResponse;

// The callSid on the caller's side
// let callerCallSid: string;

export const makeCallToService = async () => {
  const clientAccountSid = getConfigValue('clientTwilioAccountSid') as string;
  const authToken = getConfigValue('clientTwilioAuthToken') as string;
  const from = getConfigValue('clientSmsPhoneNumber') as string;
  // const serviceAccountSid = getConfigValue('twilioAccountSid') as string;
  const to = getConfigValue('voicePhoneNumber') as string;

  const response = new VoiceResponse();
  response.say({ loop: 100 }, "Hello, I'm an end to end test");

  const client = twilio(clientAccountSid, authToken);
  //const call =
  await client.calls.create({
    method: 'GET',
    twiml: response,
    from,
    to,
  });
  //callerCallSid = call.sid;
};
