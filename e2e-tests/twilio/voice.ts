import { getConfigValue } from '../config';
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
