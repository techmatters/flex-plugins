import type { ALBEvent, ALBResult } from 'aws-lambda';
import axios from 'axios';
import { isValidTwilioRequest } from './requestValidator';
import { getSsmParameter } from './ssmCache';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
};

/**
 * Fetches information about an IP address using the ipfind API.
 * 
 * @param {string} ip - The IP address to look up.
 * @param {string} apiKey - The API key for authenticating with the ipfind service.
 * @returns {Promise<any>} - A promise that resolves with the IP information data.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */
async function getIPInfo(ip: string, apiKey: string): Promise<any> {
  try {
    const response = await axios.get(`https://api.ipfind.com`, {
      params: {
        ip: ip,
        auth: apiKey,
      },
    });

    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error fetching IP info:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}

/**
 * Handles errors by logging them and returning a structured ALBResult with the error message.
 * 
 * @param {string} message - A descriptive error message.
 * @param {Error} [error] - An optional error object for detailed information.
 * @param {number} [statusCode=500] - The HTTP status code for the response.
 * @returns {ALBResult} - A structured ALBResult containing the error message and status code.
 */
const handleError = (message: string, error?: Error, statusCode = 500): ALBResult => {
  if (error) {
    console.error(message, error);
  } else {
    console.error(message);
  }
  return {
    statusCode,
    headers,
    body: JSON.stringify({ message, error: error?.message }),
  };
};

/**
 * AWS Lambda handler for processing ALB events. 
 * 
 * Supports POST requests for validating Twilio requests and retrieving IP information,
 * as well as OPTIONS requests for CORS preflight.
 * 
 * @param {ALBEvent} event - The ALB event payload passed to the Lambda function.
 * @returns {Promise<ALBResult>} - The HTTP response object for ALB.
 */
export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  if (event.httpMethod === 'POST') {
    if (!event.body) {
      return handleError('Event body is null or undefined');
    }

    try {
      const body = JSON.parse(event.body);
      const accountSid = body.trigger?.message?.AccountSid;
      const ip = body.trigger?.message?.ChannelAttributes?.pre_engagement_data?.ip;

      if (!accountSid) {
        return handleError('Account SID is missing in the event body');
      }
      if (!ip) {
        return handleError('IP is missing in the event body');
      }

      // Retrieve the parameter name and get the auth token
      const paramName = `/${process.env.NODE_ENV}/twilio/${accountSid}/auth_token`;
      if (!paramName) {
        return handleError('Parameter name not found for account SID');
      }

      const authToken = await getSsmParameter(paramName);
      if (!authToken) {
        return handleError('Auth token not found');
      }

      // Validate Twilio request
      const validRequest = isValidTwilioRequest(authToken, event);
      if (validRequest) {
        // Retrieve the IP find API key
        const apiKey = await getSsmParameter(`/IP_FIND_API_KEY`);
        try {
          const response = await getIPInfo(ip, apiKey);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
          };
        } catch (error) {
          return handleError('Error calling getIPInfo', error as Error);
        }
      } else {
        return handleError('Invalid Request', new Error('Signature verification failed'), 403);
      }
    } catch (error) {
      return handleError('Error handling the POST request', error as Error);
    }
  } else if (event.httpMethod === 'OPTIONS') {
    // Handle preflight CORS requests
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle unsupported HTTP methods
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
  };
};