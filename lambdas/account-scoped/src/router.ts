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
import { handleUpdateWorkersSkills } from './worker/updateSkills';
import { handleGetProfileFlagsForIdentifier } from './hrm/getProfileFlagsForIdentifier';
import { handleToggleSwitchboardQueue } from './hrm/toggleSwitchboardQueue';
import { assignOfflineContactInitHandler } from './task/assignOfflineContactInit';
import { assignOfflineContactResolveHandler } from './task/assignOfflineContactResolve';
import {
  handleCaptureChannelWithBot,
  handleChatbotCallback,
  handleChatbotCallbackCleanup,
} from './channelCapture';
import { addParticipantHandler } from './conference/addParticipant';
import {
  FlexValidatedHttpRequest,
  validateFlexTokenRequest,
} from './validation/flexToken';
import { getParticipantHandler } from './conference/getParticipant';
import { updateParticipantHandler } from './conference/updateParticipant';
import { removeParticipantHandler } from './conference/removeParticipant';
import { participantStatusCallbackHandler } from './conference/participantStatusCallback';
import { handleOperatingHours } from './operatingHours';
import { handleEndChat } from './conversation/endChat';
import { checkBlockListHandler } from './conversation/checkBlockList';
import { transitionAgentParticipantsHandler } from './conversation/transitionAgentParticipants';
import { conferenceStatusCallbackHandler } from './conference/conferenceStatusCallback';
import './conference/stopRecordingWhenLastAgentLeaves';
import './conference/setEndConferenceOnExit';
import { instagramToFlexHandler } from './customChannels/instagram/instagramToFlex';
import { flexToInstagramHandler } from './customChannels/instagram/flexToInstagram';
import { telegramToFlexHandler } from './customChannels/telegram/telegramToFlex';
import { flexToTelegramHandler } from './customChannels/telegram/flexToTelegram';
import { modicaToFlexHandler } from './customChannels/modica/modicaToFlex';
import { flexToModicaHandler } from './customChannels/modica/flexToModica';
import { lineToFlexHandler } from './customChannels/line/lineToFlex';
import { flexToLineHandler } from './customChannels/line/flexToLine';
import { handleConversationEvent } from './conversation';
import { getTaskAndReservationsHandler } from './task/getTaskAndReservations';
import { checkTaskAssignmentHandler } from './task/checkTaskAssignment';
import { completeTaskAssignmentHandler } from './task/completeTaskAssignment';
import { cancelOrRemoveTaskHandler } from './task/cancelOrRemoveTask';
import { initWebchatHandler } from './webchatAuthentication/initWebchat';
import { refreshTokenHandler } from './webchatAuthentication/refreshToken';
import { getAccountSid } from '@tech-matters/twilio-configuration';
import { validateRequestWithTwilioJwtToken } from './validation/twilioJwt';
import { transferStartHandler } from './transfer/transferStart';
import { reportToIWFHandler } from './integrations/iwf/reportToIWF';
import { selfReportToIWFHandler } from './integrations/iwf/selfReportToIWF';
import { populateCounselorsHandler } from './worker/populateCounselors';
import { getWorkerAttributesHandler } from './worker/getWorkerAttributes';
import { listWorkerQueuesHandler } from './worker/listWorkerQueues';
import { pullTaskHandler } from './worker/pullTask';
import { sendSystemMessageHandler } from './conversation/sendSystemMessage';
import { sendStudioMessageHandler } from './conversation/sendStudioMessage';
import { sendMessageAndRunJanitorHandler } from './conversation/sendMessageAndRunJanitor';
import { issueSyncTokenHandler } from './issueSyncToken';
import { getExternalRecordingS3LocationHandler } from './conversation/getExternalRecordingS3Location';
import { getMediaUrlHandler } from './conversation/getMediaUrl';
import {
  savePostSurveyHandler,
  voicePostSurveyActionHandler,
} from './hrm/voicePostSurvey';

/**
 * Super simple router sufficient for directly ported Twilio Serverless functions
 * All endpoints are POSTS and have no variables in their paths or query strings, everything is in the request body
 * Therefore a simple map of path -> handler will suffice
 * We should evolve these endpoints to be, dare I say it, more RESTful in the future.
 * At that point we should decide whether to evolve this router or replace it with a 3rd party one
 */

export const ROUTE_PREFIX = '/lambda/twilio/account-scoped/';
type RouteParam = Omit<
  FunctionRoute | FunctionRoute<FlexValidatedHttpRequest>,
  'responseType'
> & { responseType?: FunctionRoute['responseType'] };

const newRoute = (
  route: RouteParam,
): FunctionRoute | FunctionRoute<FlexValidatedHttpRequest> => ({
  responseType: 'json',
  ...route,
});

const ACCOUNTSID_ROUTES: Record<
  string,
  FunctionRoute | FunctionRoute<FlexValidatedHttpRequest>
> = {
  'webhooks/taskrouterCallback': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleTaskRouterEvent,
  }),
  getProfileFlagsForIdentifier: newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleGetProfileFlagsForIdentifier,
  }),
  'channelCapture/captureChannelWithBot': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleCaptureChannelWithBot,
  }),
  'channelCapture/chatbotCallback': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleChatbotCallback,
  }),
  'channelCapture/chatbotCallbackCleanup': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleChatbotCallbackCleanup,
  }),
  'hrm/savePostSurvey': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: savePostSurveyHandler,
  }),
  'hrm/voicePostSurveyAction': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: voicePostSurveyActionHandler,
  }),
  'conference/conferenceStatusCallback': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: conferenceStatusCallbackHandler,
  }),
  'conference/addParticipant': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: addParticipantHandler,
  }),
  'conference/getParticipant': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: getParticipantHandler,
  }),
  'conference/removeParticipant': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: removeParticipantHandler,
  }),
  'conference/updateParticipant': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: updateParticipantHandler,
  }),
  'conference/participantStatusCallback': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: participantStatusCallbackHandler,
  }),
  'conversations/serviceScopedConversationEventHandler': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: handleConversationEvent,
  }),
  'conversation/checkBlockList': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: checkBlockListHandler,
  }),
  'conversation/transitionAgentParticipants': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: transitionAgentParticipantsHandler,
  }),
  'customChannels/instagram/instagramToFlex': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: instagramToFlexHandler,
  }),
  'customChannels/instagram/flexToInstagram': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: flexToInstagramHandler,
  }),
  'customChannels/telegram/telegramToFlex': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: telegramToFlexHandler,
  }),
  'customChannels/telegram/flexToTelegram': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: flexToTelegramHandler,
  }),
  'customChannels/modica/modicaToFlex': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: modicaToFlexHandler,
  }),
  'customChannels/modica/flexToModica': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: flexToModicaHandler,
  }),
  'customChannels/line/lineToFlex': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: lineToFlexHandler,
  }),
  'customChannels/line/flexToLine': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: flexToLineHandler,
  }),
  'webchatAuth/initWebchat': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: initWebchatHandler,
  }),
  'webchatAuth/refreshToken': newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: refreshTokenHandler,
  }),
  toggleSwitchboardQueue: newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'supervisor' }),
    ],
    handler: handleToggleSwitchboardQueue,
  }),
  'task/assignOfflineContactInit': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: assignOfflineContactInitHandler,
  }),
  'task/assignOfflineContactResolve': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: assignOfflineContactResolveHandler,
  }),
  endChat: newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'guest' }),
    ],
    handler: handleEndChat,
  }),
  operatingHours: newRoute({
    requestPipeline: [validateRequestMethod('POST')],
    handler: handleOperatingHours,
  }),
  'task/checkTaskAssignment': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: checkTaskAssignmentHandler,
  }),
  'task/completeTaskAssignment': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: completeTaskAssignmentHandler,
  }),
  'task/cancelOrRemoveTask': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: cancelOrRemoveTaskHandler,
  }),
  'task/getTaskAndReservations': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: getTaskAndReservationsHandler,
  }),
  'transfer/transferStart': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: transferStartHandler,
  }),
  updateWorkersSkills: newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'supervisor' }),
    ],
    handler: handleUpdateWorkersSkills,
  }),
  'integrations/iwf/reportToIWF': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: reportToIWFHandler,
  }),
  'integrations/iwf/selfReportToIWF': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: selfReportToIWFHandler,
  }),
  'conversation/getExternalRecordingS3Location': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: getExternalRecordingS3LocationHandler,
  }),
  'conversation/getMediaUrl': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: getMediaUrlHandler,
  }),
  'worker/populateCounselors': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: populateCounselorsHandler,
  }),
  'worker/getWorkerAttributes': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: getWorkerAttributesHandler,
  }),
  'worker/listWorkerQueues': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: listWorkerQueuesHandler,
  }),
  'worker/pullTask': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: pullTaskHandler,
  }),
  'conversation/sendSystemMessage': newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: sendSystemMessageHandler,
  }),
  'conversation/sendStudioMessage': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: sendStudioMessageHandler,
  }),
  'conversation/sendMessageAndRunJanitor': newRoute({
    requestPipeline: [validateRequestMethod('POST'), validateWebhookRequest],
    handler: sendMessageAndRunJanitorHandler,
  }),
  issueSyncToken: newRoute({
    requestPipeline: [
      validateRequestMethod('POST'),
      validateFlexTokenRequest({ tokenMode: 'agent' }),
    ],
    handler: issueSyncTokenHandler,
  }),
};

const ENV_SHORTCODE_ROUTES: Record<string, FunctionRoute> = {
  'webchatAuthentication/initWebchat': {
    requestPipeline: [validateRequestMethod('POST')],
    handler: initWebchatHandler,
    responseType: 'json',
  },
  'webchatAuthentication/refreshToken': {
    requestPipeline: [validateRequestMethod('POST'), validateRequestWithTwilioJwtToken],
    handler: refreshTokenHandler,
    responseType: 'json',
  },
  endChat: {
    requestPipeline: [validateRequestMethod('POST'), validateRequestWithTwilioJwtToken],
    handler: handleEndChat,
    responseType: 'json',
  },
  operatingHours: {
    requestPipeline: [validateRequestMethod('POST')],
    handler: handleOperatingHours,
    responseType: 'json',
  },
};

export const lookupRoute = async (
  event: HttpRequest,
): Promise<
  AccountScopedRoute | AccountScopedRoute<FlexValidatedHttpRequest> | undefined
> => {
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
          requestPipeline: [...functionRoute.requestPipeline],
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
          requestPipeline: [...functionRoute.requestPipeline],
        };
      }
    }
  }
};
