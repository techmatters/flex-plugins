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

import { validateWebhookRequest } from './validation/twilioWebhook';
import { AccountScopedRoute, FunctionRoute, HttpRequest } from './httpTypes';
import { validateRequestMethod } from './validation/method';
import { isAccountSID } from './twilioTypes';
import { handleTaskRouterEvent } from './taskrouter';
import { handleGetProfileFlagsForIdentifier } from './hrm/getProfileFlagsForIdentifier';

/**
 * Super simple router sufficient for directly ported Twilio Serverless functions
 * All endpoints are POSTS and have no variables in their paths or query strings, everything is in the request body
 * Therefore a simple map of path -> handler will suffice
 * We should evolve these endpoints to be, dare I say it, more RESTful in the future.
 * At that point we should decide whether to evolve this router or replace it with a 3rd party one
 */

const ROUTE_PREFIX = '/lambda/twilio/account-scoped/';

const INITIAL_PIPELINE = [validateRequestMethod];

const ROUTES: Record<string, FunctionRoute> = {
  'webhooks/taskrouterCallback': {
    requestPipeline: [validateWebhookRequest],
    handler: handleTaskRouterEvent,
  },
  getProfileFlagsForIdentifier: {
    requestPipeline: [validateWebhookRequest],
    handler: handleGetProfileFlagsForIdentifier,
  },
};

export const lookupRoute = (event: HttpRequest): AccountScopedRoute | undefined => {
  if (event.path.startsWith(ROUTE_PREFIX)) {
    const path = event.path.substring(ROUTE_PREFIX.length);
    const [accountSid, ...applicationPathParts] = path.split('/');
    console.debug(
      `Looking up route for account ${accountSid} and path ${applicationPathParts.join('/')}`,
    );
    const functionRoute = ROUTES[applicationPathParts.join('/')];
    if (functionRoute && isAccountSID(accountSid)) {
      console.debug(
        `Found route for account ${accountSid} and path ${applicationPathParts.join('/')}`,
      );
      return {
        accountSid,
        ...functionRoute,
        requestPipeline: [...INITIAL_PIPELINE, ...functionRoute.requestPipeline],
      };
    }
  }
};
