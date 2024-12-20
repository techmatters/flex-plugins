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

import { ErrorResult, newErr, Result } from './Result';

/**
 * Super simple router sufficient for directly ported Twilio Serverless functions
 * All endpoints are POSTS and have no variables in their paths or query strings, everything is in the request body
 * Therefore a simple map of path -> handler will suffice
 * We should evolve these endpoints to be, dare I say it, more RESTful in the future.
 * At that point we should decide whether to evolve this router or replace it with a 3rd party one
 */

const ROUTE_PREFIX = '/lambda/twilio/account-scoped';

export type HttpError = {
  statusCode: number;
  cause?: Error;
};

type HttpRequest = {
  method: string;
  path: string;
  body: any;
};

export type Handler = (
  event: HttpRequest,
) => Promise<Result<ErrorResult<HttpError>, any>>;

type PipelineStep<Item> = (item: Item) => Promise<Result<ErrorResult<HttpError>, Item>>;

export type FunctionRoute = {
  requestPipeline: PipelineStep<HttpRequest>[];
  handler: Handler;
};

export type AccountScopedRoute = FunctionRoute & {
  accountSid: string;
};

const ROUTES: Record<string, FunctionRoute> = {
  'webhooks/taskrouterCallback': {
    requestPipeline: [],
    handler: async (event: HttpRequest) =>
      newErr({
        message: `Not implemented: ${event.method} - ${event.path}`,
        error: {
          statusCode: 405,
        },
      }),
  },
};

export const lookupRoute = (event: HttpRequest): AccountScopedRoute => {
  if (event.path.startsWith(ROUTE_PREFIX)) {
    const path = event.path.substring(ROUTE_PREFIX.length);
    const [accountSid, ...applicationPathParts] = path.split('/');
    const functionRoute = ROUTES[applicationPathParts.join('/')];
    if (functionRoute) {
      return {
        accountSid,
        ...functionRoute,
      };
    }
  }
  return null;
};
