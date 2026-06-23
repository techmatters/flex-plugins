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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import {
  getSurveyWorkflowSid,
  getSyncServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newOk, Result } from '../Result';
import { savePostSurvey } from './savePostSurvey';
import { newMissingParameterResult } from '../httpErrors';
import TwilioSDK from 'twilio';
import VoiceResponse = TwilioSDK.twiml.VoiceResponse;
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

const getPostSurveySyncDocUniqueName = (callerIdentifier: string) =>
  `post-studio-flow-call-data-${callerIdentifier}`;

export const savePostSurveyHandler: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, any>> => {
  const { postSurveyAnswers, clientIdentifier } = request.body;
  const twilioClient = await getTwilioClient(accountSid);
  const logPrefix = `[Post Survey Studio Flow - ${accountSid}/${clientIdentifier}]:`;

  console.debug(
    `${logPrefix} Studio Flow call`,
    await twilioClient.calls.get(clientIdentifier).fetch(),
  );
  const docUniqueName = getPostSurveySyncDocUniqueName(clientIdentifier);
  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${clientIdentifier}]: Looking up sync doc ${docUniqueName}`,
  );
  await twilioClient.sync.v1.services
    .get(await getSyncServiceSid(accountSid))
    .documents.create({
      uniqueName: docUniqueName,
      data: { postSurveyAnswers, clientIdentifier },
      ttl: 120,
    });
  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${clientIdentifier}]: Stored post survey answers in sync doc ${docUniqueName}`,
  );
  return newOk(undefined);
};

export const voicePostSurveyActionHandler: AccountScopedHandler = async (
  { query, body },
  accountSid,
) => {
  const twilioClient = await getTwilioClient(accountSid);
  const { contactId, contactTaskSid: taskSid } = query;
  const { DialCallSid: clientIdentifier } = body;
  if (!clientIdentifier) return newMissingParameterResult('DialCallSid');
  const logPrefix = `[Post Survey Studio Flow - ${accountSid}/${taskSid}]:`;
  console.debug(
    `${logPrefix} DialCallSid call`,
    await twilioClient.calls.get(clientIdentifier).fetch(),
  );
  const uniqueName = getPostSurveySyncDocUniqueName(clientIdentifier);
  console.debug(
    `${logPrefix} Dial Action URL called for contact ID ${contactId} and contact task SID ${taskSid}, retrieving post survey data under sync doc ${uniqueName} for use in the post flow.`,
  );
  const docContext = twilioClient.sync.v1.services
    .get(await getSyncServiceSid(accountSid))
    .documents.get(uniqueName);
  const {
    data: { postSurveyAnswers },
  } = await docContext.fetch();
  console.debug(
    `${logPrefix} Dial Action URL called for contact ID ${contactId} and contact task SID ${taskSid}, retrieved post survey data under sync doc ${uniqueName} for use in the post flow.`,
  );
  const controlTask = await twilioClient.taskrouter.v1
    .workspaces(await getWorkspaceSid(accountSid))
    .tasks.create({
      attributes: JSON.stringify({
        contactTaskId: taskSid,
        contactId,
        isSurveyTask: true,
      }),
      workflowSid: await getSurveyWorkflowSid(accountSid),
      taskChannel: 'survey',
    });

  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Created new post studio flow task ${controlTask.sid} for storing post survey data in insights`,
  );
  await savePostSurvey({ twilioClient, accountSid, controlTask, postSurveyAnswers });
  // As survey tasks will never be assigned to a worker, they'll be kept in pending state. A pending can't transition to completed state, so we cancel them here to raise a task.canceled taskrouter event (see functions/taskrouterListeners/janitorListener.ts)
  // This needs to be the last step so the new task attributes from saveSurveyInInsights make it to insights
  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Saved new post survey to HRM for contact ${contactId} and updated controlTask ${controlTask.sid} for insights.`,
  );
  await controlTask.update({ assignmentStatus: 'canceled' });
  await docContext.remove();

  const successMessage = `${logPrefix} Dial Action URL called for contact ID ${contactId} and contact task SID ${taskSid}, retrieved post survey data under sync doc ${uniqueName} and saved it with contact context.`;
  return newOk({ message: successMessage });
};

export const voicePostSurveyAnswerHandler: AccountScopedHandler = async (
  { query, body },
  accountSid,
) => {
  const twilioClient = await getTwilioClient(accountSid);
  const { Digits: digits } = body;
  const { hrm_base_url: hrmBaseUrl } =
    await retrieveServiceConfigurationAttributes(twilioClient);
  const { contactId, contactTaskSid: taskSid, answer1, answer2 } = query;
  const response = new VoiceResponse();
  const logPrefix = `[Post Survey Studio Flow - ${accountSid}]:`;
  if (!digits) {
    console.debug(`${logPrefix} No digits, gathering for first answer`);
    response.say('Press 1 to continue');
    response.gather({
      method: 'POST',
      numDigits: 1,
      timeout: 10,
      // Query parameters must be alphabetical for webhook validation to work :-/
      action: `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/hrm/voicePostSurveyAnswer?contactId=${contactId}&contactTaskSid=${taskSid}`,
    });
  } else if (!answer1) {
    console.debug(
      `${logPrefix} Digits supplied but no answers, saving answer1 and gathering for second answer`,
    );
    response.say('Press 2 to continue');
    response.gather({
      method: 'POST',
      numDigits: 1,
      timeout: 10,
      // Query parameters must be alphabetical for webhook validation to work :-/
      action: `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/hrm/voicePostSurveyAnswer?answer1=${digits}&contactId=${contactId}&contactTaskSid=${taskSid}`,
    });
  } else if (!answer2) {
    console.debug(
      `${logPrefix} Digits supplied and answer, saving answer2 and gathering for third answer`,
    );
    response.say('Press 3 to continue');
    response.gather({
      method: 'POST',
      numDigits: 1,
      timeout: 10,
      // Query parameters must be alphabetical for webhook validation to work :-/
      action: `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/hrm/voicePostSurveyAnswer?answer1=${answer1}&answer2=${digits}&contactId=${contactId}&contactTaskSid=${taskSid}`,
    });
  } else {
    console.debug(
      `${logPrefix} Digits supplied and two answers, saving all 3 anwsers to back end`,
    );
    const controlTask = await twilioClient.taskrouter.v1
      .workspaces(await getWorkspaceSid(accountSid))
      .tasks.create({
        attributes: JSON.stringify({
          contactTaskId: taskSid,
          contactId,
          isSurveyTask: true,
        }),
        workflowSid: await getSurveyWorkflowSid(accountSid),
        taskChannel: 'survey',
      });

    console.debug(
      `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Created new post studio flow task ${controlTask.sid} for storing post survey data in insights`,
    );
    await savePostSurvey({
      accountSid,
      postSurveyAnswers: {
        was_helpful: answer1,
        would_recommend: answer2,
        answer3: digits,
      },
      twilioClient,
      controlTask,
    });

    response.say('No go away');
  }
  return newOk(response);
};
