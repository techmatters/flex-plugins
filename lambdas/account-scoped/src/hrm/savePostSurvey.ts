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

import { LegacyOneToManyConfigSpec } from '@tech-matters/hrm-form-definitions';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { buildSurveyInsightsData } from '../channelCapture/insightsService';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { getCurrentDefinitionVersion } from './formDefinitionsCache';
import { postToInternalHrmEndpoint } from './internalHrmRequest';
import { buildDataObject, PostSurveyData } from '../postSurvey/postSurveyData';

type PostSurveyBody = {
  contactTaskId: string;
  taskId: string;
  data: PostSurveyData;
};

const saveSurveyInInsights = async (
  postSurveyConfigJson: LegacyOneToManyConfigSpec[],
  memory: PostSurveyData,
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
  postSurveyAnswers: PostSurveyData;
  controlTask: TaskInstance;
}) => {
  const serviceConfig = await twilioClient.flexApi.v1.configuration.get().fetch();

  const { hrm_api_version: hrmApiVersion } = serviceConfig.attributes;
  const definition = await getCurrentDefinitionVersion({ accountSid });
  const postSurveyConfigSpecs = definition?.insights?.postSurveySpecs;
  try {
    if (!postSurveyConfigSpecs?.length) {
      console.error(
        `Error accessing to the post survey form definitions: No defined or invalid postSurveyConfigJson found for account ${accountSid}.`,
      );
      return;
    }

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
  } catch (err) {
    console.error(
      `[${accountSid}] Error saving post survey for control task ${controlTask?.sid}:`,
      err,
    );
  }
};
