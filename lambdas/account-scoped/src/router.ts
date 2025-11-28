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
import { isAccountSID } from '@tech-matters/twilio-types';
import { handleTaskRouterEvent } from './taskrouter';
import { updateWorkersSkills } from './taskrouter/updateWorkersSkills';
import { handleGetProfileFlagsForIdentifier } from './hrm/getProfileFlagsForIdentifier';
import { handleToggleSwitchboardQueue } from './hrm/toggleSwitchboardQueue';
import {
  handleCaptureChannelWithBot,
  handleChatbotCallback,
  handleChatbotCallbackCleanup,
} from './channelCapture';
import { addParticipantHandler } from './conference/addParticipant';
import { validateFlexTokenRequest } from './validation/flexToken';
import { getParticipantHandler } from './conference/getParticipant';
import { updateParticipantHandler } from './conference/updateParticipant';
import { removeParticipantHandler } from './conference/removeParticipant';
import { participantStatusCallbackHandler } from './conference/participantStatusCallback';
import { handleOperatingHours } from './operatingHours';
import { handleEndChat } from './conversation/endChat';
import { conferenceStatusCallbackHandler } from './conference/conferenceStatusCallback';
import './conference/stopRecordingWhenLastAgentLeaves';
import { instagramToFlexHandler } from './customChannels/instagram/instagramToFlex';
import { flexToInstagramHandler } from './customChannels/instagram/flexToInstagram';
import { initWebchatHandler } from './webchatAuthentication/initWebchat';
import { refreshTokenHandler } from './webchatAuthentication/refreshToken';
import { getAccountSid } from '@tech-matters/twilio-configuration';

/**
 * Super simple router sufficient for directly ported Twilio Serverless functions
 * All endpoints are POSTS and have no variables in their paths or query strings, everything is in the request body
 * Therefore a simple map of path -> handler will suffice
 * We should evolve these endpoints to be, dare I say it, more RESTful in the future.
 * At that point we should decide whether to evolve this router or replace it with a 3rd party one
 */

export const ROUTE_PREFIX = '/lambda/twilio/account-scoped/';

const INITIAL_PIPELINE = [validateRequestMethod];

// Routes
const ACCOUNTSID_ROUTES: Record<string, FunctionRoute> = {
  'webhooks/taskrouterCallback': {
    requestPipeline: [validateWebhookRequest],
    handler: handleTaskRouterEvent,
  },
  getProfileFlagsForIdentifier: {
    requestPipeline: [validateWebhookRequest],
    handler: handleGetProfileFlagsForIdentifier,
  },
  'channelCapture/captureChannelWithBot': {
    requestPipeline: [validateWebhookRequest],
    handler: handleCaptureChannelWithBot,
  },
  'channelCapture/chatbotCallback': {
    requestPipeline: [validateWebhookRequest],
    handler: handleChatbotCallback,
  },
  'channelCapture/chatbotCallbackCleanup': {
    requestPipeline: [validateWebhookRequest],
    handler: handleChatbotCallbackCleanup,
  },
  'conference/conferenceStatusCallback': {
    requestPipeline: [validateWebhookRequest],
    handler: conferenceStatusCallbackHandler,
  },
  'conference/addParticipant': {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'worker' })],
    handler: addParticipantHandler,
  },
  'conference/getParticipant': {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'worker' })],
    handler: getParticipantHandler,
  },
  'conference/removeParticipant': {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'worker' })],
    handler: removeParticipantHandler,
  },
  'conference/updateParticipant': {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'worker' })],
    handler: updateParticipantHandler,
  },
  'conference/participantStatusCallback': {
    requestPipeline: [validateWebhookRequest],
    handler: participantStatusCallbackHandler,
  },
  'customChannels/instagram/instagramToFlex': {
    requestPipeline: [],
    handler: instagramToFlexHandler,
  },
  'customChannels/instagram/flexToInstagram': {
    requestPipeline: [validateWebhookRequest],
    handler: flexToInstagramHandler,
  },
  'webchatAuth/initWebchat': {
    requestPipeline: [],
    handler: initWebchatHandler,
  },
  'webchatAuth/refreshToken': {
    requestPipeline: [],
    handler: refreshTokenHandler,
  },
  toggleSwitchboardQueue: {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'supervisor' })],
    handler: handleToggleSwitchboardQueue,
  },
  endChat: {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'guest' })],
    handler: handleEndChat,
  },
  operatingHours: {
    requestPipeline: [],
    handler: handleOperatingHours,
  },
  updateWorkersSkills: {
    requestPipeline: [validateFlexTokenRequest({ tokenMode: 'supervisor' })],
    handler: updateWorkersSkills,
  },
};

const ENV_SHORTCODE_ROUTES: Record<string, FunctionRoute> = {
  'webchatAuth/initWebchat': {
    requestPipeline: [],
    handler: initWebchatHandler,
  },
  'webchatAuth/refreshToken': {
    requestPipeline: [],
    handler: refreshTokenHandler,
  },
};

export const lookupRoute = async (
  event: HttpRequest,
): Promise<AccountScopedRoute | undefined> => {
  if (event.path.startsWith(ROUTE_PREFIX)) {
    const path = event.path.substring(ROUTE_PREFIX.length);
    const [accountIdentifier, ...applicationPathParts] = path.split('/');
    if (isAccountSID(accountIdentifier)) {
      console.debug(
        `Looking up route for account ${accountIdentifier} and path ${applicationPathParts.join('/')}`,
      );
      const functionRoute = ACCOUNTSID_ROUTES[applicationPathParts.join('/')];
      if (functionRoute) {
        console.debug(
          `Found route for account ${accountIdentifier} and path ${applicationPathParts.join('/')}`,
        );
        return {
          accountSid: accountIdentifier,
          ...functionRoute,
          requestPipeline: [...INITIAL_PIPELINE, ...functionRoute.requestPipeline],
        };
      }
    } else {
      // Assume account identifier is a short code
      console.debug(
        `Looking up route for environment ${process.env.NODE_ENV}, shortCode ${accountIdentifier} and path ${applicationPathParts.join('/')}`,
      );
      const functionRoute = ENV_SHORTCODE_ROUTES[applicationPathParts.join('/')];
      if (functionRoute) {
        console.debug(
          `Found route for account ${accountIdentifier} and path ${applicationPathParts.join('/')}`,
        );
        return {
          accountSid: await getAccountSid(accountIdentifier),
          ...functionRoute,
          requestPipeline: [...INITIAL_PIPELINE, ...functionRoute.requestPipeline],
        };
      }
    }
  }
};
