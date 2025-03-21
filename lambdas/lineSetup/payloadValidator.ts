import { z, ZodError } from 'zod';
import InvalidInputPayloadException from './invalidInputPayloadException';

const SERVERLESS_URL_REGEX = /^(https:\/\/serverless-)\d+-(production|dev)(\.twil\.io\/webhooks\/line\/LineToFlex)$/;

const PayloadSchema = z.object({
  env: z.enum(['DEV', 'STG', 'PROD']),
  helpline: z.string(),
  lineFlexFlowSid: z.string().startsWith('FO', {
    message: 'lineFlexFlowSid must follow the pattern: FOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  }),
  lineChannelSecret: z.string(),
  lineChannelAccessToken: z.string(),
  serverlessUrl: z.string().regex(SERVERLESS_URL_REGEX, {
      message: 'serverlessUrl must follow the pattern: https://serverless-XXXX-production.twil.io/webhooks/line/LineToFlex',
  }),
  overwrite: z.boolean().optional(),
});

// Validates the payload using zod, and wraps ZodError into InvalidInputPayloadException
const validatePayload = (payload: any) => {
  try {
    PayloadSchema.parse(payload);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new InvalidInputPayloadException(err);
    }

    throw err;
  }
};

export {
  validatePayload,
};