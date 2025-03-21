import { validateRequest } from 'twilio'; // Ensure twilio module is installed and imported
import { ALBEvent} from 'aws-lambda';

export const isValidTwilioRequest = (authToken: string | undefined, event: ALBEvent): boolean => {
  if (!authToken) {
    console.error('Missing authToken');
    return false;
  }

  const host = event.headers?.host;
  const queryStringParameters = event.queryStringParameters;

  if (!host) {
    console.error('Missing host in event headers');
    return false;
  }

  const buildQueryString = (params: { [key: string]: string | undefined } | undefined | null) => {
    if (!params) return ''; // Handle undefined or null case

    return Object.keys(params)
      .filter(key => params[key] !== undefined) // Filter out undefined values
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key] as string))
      .join('&');
  };

  const queryString = buildQueryString(queryStringParameters);
  const path = event.path;
  const webhookUrl = `https://${host}${path}${queryString ? `?${queryString}` : ''}`;

  //console.log('Webhook URL:', webhookUrl);
  const twilioSignature = event.headers?.['x-twilio-signature'];

  if (!twilioSignature) {
    console.error('Missing Twilio signature in event headers');
    return false;
  }

  //console.log('authToken:', authToken);
  //console.log('twilioSignature:', twilioSignature);
  //console.log('webhookUrl:', webhookUrl);
  //console.log('params:', {});
  const isValidRequest = validateRequest(authToken, twilioSignature, webhookUrl, {});
  
  
  if (!isValidRequest) {
    console.error('Twilio signature validation failed');
  } else {
   // console.log('Twilio signature validation succeeded');
  }

  return isValidRequest;
};