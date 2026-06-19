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
import { newOk, Result } from '../Result';
import { LegacyOneToManyConfigSpec } from '@tech-matters/hrm-form-definitions';
import { LexMemory } from '../channelCapture/lexClient';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { buildSurveyInsightsData } from '../channelCapture/insightsService';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { getCurrentDefinitionVersion } from './formDefinitionsCache';
import { postToInternalHrmEndpoint } from './internalHrmRequest';
import { get } from 'lodash';
import {
  getSurveyWorkflowSid,
  getSyncServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';

export type PostSurveyData = { [question: string]: string | number };
/**
 * Given a bot's memory returns a function to reduce over an array of OneToManyConfigSpec.
 * The function returned will grab all the answers to the questions defined in the OneToManyConfigSpecs
 * and return a flattened object of type PostSurveyData
 */
const flattenOneToMany =
  (memory: PostSurveyData, pathBuilder: (question: string) => string) =>
  (accum: PostSurveyData, curr: LegacyOneToManyConfigSpec) => {
    const paths = curr.questions.map(
      question => ({
        question,
        path: pathBuilder(question),
      }), // Path where the answer for each question should be in bot memory
    );

    const values: PostSurveyData = {};
    paths.forEach(p => {
      values[p.question] = get(memory, p.path, '');
    });

    return { ...accum, ...values };
  };
/**
 * Given the config for the post survey and the bot's memory, returns the collected answers in the fomat it's stored in HRM.
 */
export const buildDataObject = (
  oneToManyConfigSpecs: LegacyOneToManyConfigSpec[],
  memory: PostSurveyData,
  pathBuilder: (question: string) => string = q => q,
) => {
  const reducerFunction = flattenOneToMany(memory, pathBuilder);
  return oneToManyConfigSpecs.reduce<PostSurveyData>(reducerFunction, {});
};

type PostSurveyBody = {
  contactTaskId: string;
  taskId: string;
  data: PostSurveyData;
};

const saveSurveyInInsights = async (
  postSurveyConfigJson: LegacyOneToManyConfigSpec[],
  memory: LexMemory,
  controlTask: TaskInstance,
  controlTaskAttributes: any,
) => {
  const finalAttributes = buildSurveyInsightsData(
    postSurveyConfigJson,
    controlTaskAttributes,
    memory,
  );

  await controlTask.update({ attributes: JSON.stringify(finalAttributes) });
};

const saveSurveyInHRM = async ({
  accountSid,
  controlTask,
  controlTaskAttributes,
  hrmApiVersion,
  postSurveyAnswers,
  postSurveyConfigSpecs,
}: {
  postSurveyConfigSpecs: LegacyOneToManyConfigSpec[];
  postSurveyAnswers: PostSurveyData;
  controlTask: TaskInstance;
  controlTaskAttributes: any;
  accountSid: AccountSID;
  hrmApiVersion: string;
}) => {
  const data = buildDataObject(postSurveyConfigSpecs, postSurveyAnswers);

  const body: PostSurveyBody = {
    contactTaskId: controlTaskAttributes.contactTaskId,
    taskId: controlTask.sid,
    data,
  };

  await postToInternalHrmEndpoint(accountSid, hrmApiVersion, 'postSurveys', body);
};

export const savePostSurvey = async ({
  accountSid,
  controlTask,
  postSurveyAnswers,
  twilioClient,
}: {
  accountSid: AccountSID;
  twilioClient: Twilio;
  postSurveyAnswers: LexMemory;
  controlTask: TaskInstance;
}) => {
  const serviceConfig = await twilioClient.flexApi.v1.configuration.get().fetch();

  const { hrm_api_version: hrmApiVersion } = serviceConfig.attributes;
  const definition = await getCurrentDefinitionVersion({ accountSid });
  const postSurveyConfigSpecs = definition?.insights?.postSurveySpecs;

  if (postSurveyConfigSpecs?.length) {
    const controlTaskAttributes = JSON.parse(controlTask.attributes);

    // parallel execution to save survey collected data in insights and hrm
    await Promise.all([
      saveSurveyInInsights(
        postSurveyConfigSpecs,
        postSurveyAnswers,
        controlTask,
        controlTaskAttributes,
      ),
      saveSurveyInHRM({
        postSurveyConfigSpecs,
        postSurveyAnswers,
        controlTask,
        controlTaskAttributes,
        accountSid,
        hrmApiVersion,
      }),
    ]);
  } else {
    const errorMessage = `No defined or invalid postSurveyConfigJson found for account ${accountSid}.`;
    console.info(`Error accessing to the post survey form definitions: ${errorMessage}`);
  }
};

export const getPostSurveySyncDocUniqueName = (callerIdentifier: string) =>
  `post-surveys-pending-${callerIdentifier.replaceAll('+', '')}`;

export const handleSavePostSurvey: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, any>> => {
  const { postSurveyAnswers, clientIdentifier } = request.body;
  const twilioClient = await getTwilioClient(accountSid);
  const docUniqueName = getPostSurveySyncDocUniqueName(clientIdentifier);
  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${clientIdentifier}]: Looking up sync doc ${docUniqueName}`,
  );
  const docContext = twilioClient.sync.v1.services
    .get(await getSyncServiceSid(accountSid))
    .documents.get(docUniqueName);
  const doc = await docContext.fetch();
  const { taskSid, contactId } = doc.data;
  console.debug(
    `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Retrieved contactId ${contactId} and taskSid ${taskSid} from sync doc ${docUniqueName}`,
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
  return newOk(undefined);
};
