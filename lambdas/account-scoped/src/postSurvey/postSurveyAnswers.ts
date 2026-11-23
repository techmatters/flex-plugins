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

import { buildSurveyInsightsData } from '../channelCapture/insightsService';
import { LegacyOneToManyConfigSpec } from '@tech-matters/hrm-form-definitions';
import { PostSurveyData } from './postSurveyData';

const isAnswered = (answer: unknown) =>
  answer !== undefined && answer !== null && answer !== '';

export const answeredQuestions = (answers: PostSurveyData): PostSurveyData =>
  Object.fromEntries(Object.entries(answers).filter(([, answer]) => isAnswered(answer)));

/**
 * Adds the answered questions in newAnswers to the answers recorded so far.
 * Unanswered questions never overwrite a recorded answer, e.g. when a chatbot session restarts.
 */
export const mergePostSurveyAnswers = (
  recordedAnswers: PostSurveyData,
  newAnswers: PostSurveyData,
): PostSurveyData => ({ ...recordedAnswers, ...answeredQuestions(newAnswers) });

/**
 * Control task attributes with the raw answers (used to patch HRM) alongside their Insights representation.
 * Insights attributes are rebuilt from all the answers each time, so this can be applied repeatedly.
 */
export const withPostSurveyAnswers = (
  postSurveySpecs: LegacyOneToManyConfigSpec[],
  controlTaskAttributes: Record<string, any>,
  answers: PostSurveyData,
) => ({
  ...buildSurveyInsightsData(postSurveySpecs, controlTaskAttributes, answers),
  postSurveyAnswers: answers,
});
