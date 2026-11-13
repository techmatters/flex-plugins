/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, newOk, Result } from '@tech-matters/result-type';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { getCurrentDefinitionVersion } from '../hrm/formDefinitionsCache';
import { patchOnInternalHrmEndpoint } from '../hrm/internalHrmRequest';
import { patchTaskAttributes } from '../task/patchTaskAttributes';
import { buildDataObject, PostSurveyData } from './postSurveyData';
import {
  answeredQuestions,
  mergePostSurveyAnswers,
  withPostSurveyAnswers,
} from './postSurveyAnswers';
import { cancelPostSurveyControlTask } from './postSurveyControlTask';

type HrmPostSurveyPatch = {
  contactTaskId: string;
  data: PostSurveyData;
};

/**
 * Records the answered questions on the post survey control task (raw answers and their Insights representation)
 * and upserts the post survey in HRM with all the answers recorded so far.
 * Nothing is recorded if there are no answered questions, so blank surveys are never saved.
 */
export const recordPostSurveyAnswers = async ({
  accountSid,
  controlTaskSid,
  answers,
}: {
  accountSid: AccountSID;
  controlTaskSid: string;
  answers: PostSurveyData;
}): Promise<Result<HttpError, { recorded: boolean }>> => {
  const logPrefix = `[Post Survey - ${accountSid}/${controlTaskSid}]:`;
  if (!Object.keys(answeredQuestions(answers)).length) {
    console.debug(`${logPrefix} No answered questions, nothing to record.`);
    return newOk({ recorded: false });
  }

  const definition = await getCurrentDefinitionVersion({ accountSid });
  const postSurveySpecs = definition?.insights?.postSurveySpecs;
  if (!postSurveySpecs?.length) {
    return newHttpErrorResult(
      `${logPrefix} No post survey specs found in the form definitions.`,
      500,
    );
  }

  let hrmPatch: HrmPostSurveyPatch | undefined;
  const patchResult = await patchTaskAttributes(
    accountSid,
    controlTaskSid as TaskSID,
    controlTaskAttributes => {
      const allAnswers = mergePostSurveyAnswers(
        controlTaskAttributes.postSurveyAnswers ?? {},
        answers,
      );
      hrmPatch = {
        contactTaskId: controlTaskAttributes.contactTaskId,
        data: buildDataObject(postSurveySpecs, allAnswers),
      };
      return withPostSurveyAnswers(postSurveySpecs, controlTaskAttributes, allAnswers);
    },
  );
  if (isErr(patchResult)) {
    return newHttpErrorResult(patchResult.error.errorInstance, 500, patchResult.message);
  }

  const { hrm_api_version: hrmApiVersion } = await retrieveServiceConfigurationAttributes(
    await getTwilioClient(accountSid),
  );
  const hrmResult = await patchOnInternalHrmEndpoint(
    accountSid,
    hrmApiVersion,
    `postSurveys/${controlTaskSid}`,
    hrmPatch,
  );
  if (isErr(hrmResult)) {
    console.error(`${logPrefix} Failed to save post survey answers in HRM.`, hrmResult);
    return newHttpErrorResult(hrmResult.error, 500, hrmResult.message);
  }

  console.info(`${logPrefix} Recorded post survey answers.`);
  return newOk({ recorded: true });
};

export const recordPostSurveyAnswersHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { controlTaskSid, answers = {}, surveyComplete } = body;
  if (!controlTaskSid) return newMissingParameterResult('controlTaskSid');

  const recordResult = await recordPostSurveyAnswers({
    accountSid,
    controlTaskSid,
    answers,
  });
  if (isErr(recordResult)) return recordResult;

  // Studio sends booleans in a JSON body, but string values if sent as form parameters
  if (surveyComplete === true || surveyComplete === 'true') {
    await cancelPostSurveyControlTask(
      await getTwilioClient(accountSid),
      accountSid,
      controlTaskSid,
    );
  }
  return newOk({ message: 'Post survey answers recorded' });
};
