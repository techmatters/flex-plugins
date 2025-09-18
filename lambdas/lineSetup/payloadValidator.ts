/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { z, ZodError } from 'zod';
import InvalidInputPayloadException from './invalidInputPayloadException';

const SERVERLESS_URL_REGEX =
  /^(https:\/\/serverless-)\d+-(production|dev)(\.twil\.io\/webhooks\/line\/LineToFlex)$/;

const PayloadSchema = z.object({
  env: z.enum(['DEV', 'STG', 'PROD']),
  helpline: z.string(),
  lineFlexFlowSid: z.string().startsWith('FO', {
    message:
      'lineFlexFlowSid must follow the pattern: FOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  }),
  lineChannelSecret: z.string(),
  lineChannelAccessToken: z.string(),
  serverlessUrl: z.string().regex(SERVERLESS_URL_REGEX, {
    message:
      'serverlessUrl must follow the pattern: https://serverless-XXXX-production.twil.io/webhooks/line/LineToFlex',
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

export { validatePayload };
