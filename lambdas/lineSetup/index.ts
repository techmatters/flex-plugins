import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
  PutParameterCommandInput,
} from '@aws-sdk/client-ssm';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import type { ALBEvent, ALBResult } from 'aws-lambda';
import { Readable } from 'stream';

import { validatePayload } from './payloadValidator';
import InvalidInputPayloadException from './invalidInputPayloadException';
import ResourceAlreadyExistsException from './resourceAlreadyExistsException';
import SyntaxErrorException from './syntaxErrorException';

declare var fetch: typeof import('undici').fetch;

type WebhookMap = { [lineNumber: string]: string };

const ssmClient = new SSMClient({ region: 'us-east-1' });
const s3Client = new S3Client({});

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);
  return response.Parameter?.Value;
};

export const putSsmParameter = async (request: PutParameterCommandInput) => {
  const command = new PutParameterCommand(request);
  return ssmClient.send(command);
};

export const getS3Object = async (Bucket: string, Key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentType: 'application/json',
  });
  const response = await s3Client.send(command);

  let responseDataChunks: Buffer[] = [];
  const responseBody = response.Body as Readable;

  return new Promise<string>(async (resolve, reject) => {
    try {
      responseBody.once('error', err => reject(err));
      responseBody.on('data', (chunk: Buffer) => responseDataChunks.push(chunk));
      responseBody.once('end', () =>
        resolve(Buffer.concat(responseDataChunks).toString()),
      );
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
};

export const putS3Object = async (request: PutObjectCommandInput) => {
  const command = new PutObjectCommand(request);
  return s3Client.send(command);
};

const getLineNumber = async (lineChannelAccessToken: string) => {
  const lineBotInfoUrl = 'https://api.line.me/v2/bot/info';
  var options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lineChannelAccessToken}`,
    },
  };

  const lineResponse = await fetch(lineBotInfoUrl, options);
  const lineResponseJson = await lineResponse.json();
  const lineNumber = (lineResponseJson as any).userId;
  return lineNumber;
};

const getLineWebhookMap = async (): Promise<WebhookMap> => {
  const obj = await getS3Object('aselo-webhooks', 'line-webhook-map.json');

  if (!obj) throw new Error('Body property missing on aselo-webhooks object');

  const webhookMap = JSON.parse(obj.toString());
  return webhookMap;
};

const throwIfSSMParameterExists = async (name: string) => {
  if (await getSsmParameter(name)) {
    throw new ResourceAlreadyExistsException(`${name} already exists at Parameter Store`);
  }
};

const throwIfWebhookMapEntryExists = (webhookMap: WebhookMap, lineNumber: string) => {
  if (webhookMap[lineNumber]) {
    throw new ResourceAlreadyExistsException(
      `Line number ${lineNumber} is already mapped at line-webhook-map.json`,
    );
  }
};

// Throws SyntaxErrorException if payload contains syntax error
const SYNTAX_ERROR = 'SyntaxError';
const parsePayload = (payloadString: string) => {
  try {
    const payload = JSON.parse(payloadString);
    return payload;
  } catch (err) {
    if (err instanceof Error && err.name === SYNTAX_ERROR) {
      throw new SyntaxErrorException(err.message);
    }

    throw err;
  }
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
    };
  }

  if (event.body === null) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'payload is missing' }),
    };
  }

  try {
    const payload = parsePayload(event.body);
    validatePayload(payload); // Throws InvalidInputPayloadException if payload is not valid

    const {
      env,
      helpline,
      lineFlexFlowSid,
      lineChannelSecret,
      lineChannelAccessToken,
      serverlessUrl,
      overwrite,
    } = payload;

    const webhookMap = await getLineWebhookMap();
    const lineNumber = await getLineNumber(lineChannelAccessToken);

    // SSM Parameter Names
    const lineFlexFlowSidSSMName = `${env}_TWILIO_${helpline}_LINE_FLEX_FLOW_SID`;
    const lineChannelSecretSSMName = `${env}_LINE_${helpline}_CHANNEL_SECRET`;
    const lineChannelAccessTokenSSMName = `${env}_LINE_${helpline}_CHANNEL_ACCESS_TOKEN`;

    // Throws ResourceAlreadyExistsException in case any resource already exists
    if (!overwrite) {
      throwIfWebhookMapEntryExists(webhookMap, lineNumber),
        await Promise.all([
          throwIfSSMParameterExists(lineFlexFlowSidSSMName),
          throwIfSSMParameterExists(lineChannelSecretSSMName),
          throwIfSSMParameterExists(lineChannelAccessTokenSSMName),
        ]);
    }

    // Add new line-webhook-map entry
    webhookMap[lineNumber] = serverlessUrl;

    await Promise.all([
      // Update line-webhook-map.json
      putS3Object({
        Bucket: 'aselo-webhooks',
        Key: 'line-webhook-map.json',
        Body: JSON.stringify(webhookMap, null, 2),
        ContentType: 'application/json; charset=utf-8',
      }),

      // Save lineFlexFlowSid at SSM
      putSsmParameter({
        Name: lineFlexFlowSidSSMName,
        Value: lineFlexFlowSid,
        Type: 'SecureString',
        Overwrite: overwrite,
      }),

      // Save lineChannelSecret at SSM
      putSsmParameter({
        Name: lineChannelSecretSSMName,
        Value: lineChannelSecret,
        Type: 'SecureString',
        Overwrite: overwrite,
      }),

      // Save lineChannelAccessToken at SSM
      putSsmParameter({
        Name: lineChannelAccessTokenSSMName,
        Value: lineChannelAccessToken,
        Type: 'SecureString',
        Overwrite: overwrite,
      }),
    ]);

    // Build response payload
    const responsePayload = {
      success: true,
      addedResources: {
        lineWebhookMap: {
          lineNumber: lineNumber,
        },
        parameterStore: [
          lineFlexFlowSidSSMName,
          lineChannelSecretSSMName,
          lineChannelAccessTokenSSMName,
        ],
      },
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (err) {
    // Return 400 for syntax error
    if (SyntaxErrorException.instanceOf(err)) {
      return err.syntaxErrorResponse();
    }

    // Return 422 for invalid payload (validated using zod)
    if (InvalidInputPayloadException.instanceOf(err)) {
      return err.invalidInputPayloadResponse();
    }

    // Return 409 when resource already exists (and overwrite = false)
    if (ResourceAlreadyExistsException.instanceOf(err)) {
      return err.resourceAlreadyExistsResponse();
    }

    throw err;
  }
};
