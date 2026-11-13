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

import { InsightsObject } from '@tech-matters/hrm-form-definitions';
import {
  answeredQuestions,
  mergePostSurveyAnswers,
  withPostSurveyAnswers,
} from '../../../src/postSurvey/postSurveyAnswers';

describe('answeredQuestions', () => {
  test('drops empty, null and undefined answers', () => {
    expect(
      answeredQuestions({
        q1: 'yes',
        q2: '',
        q3: null as any,
        q4: undefined as any,
        q5: 0,
      }),
    ).toStrictEqual({ q1: 'yes', q5: 0 });
  });
});

describe('mergePostSurveyAnswers', () => {
  test('adds new answers to the recorded ones', () => {
    expect(mergePostSurveyAnswers({ q1: 'yes' }, { q3: 'no' })).toStrictEqual({
      q1: 'yes',
      q3: 'no',
    });
  });

  test('a new answer replaces the recorded answer to the same question', () => {
    expect(mergePostSurveyAnswers({ q1: 'yes' }, { q1: 'no' })).toStrictEqual({
      q1: 'no',
    });
  });

  test('an unanswered question never erases a recorded answer', () => {
    expect(
      mergePostSurveyAnswers({ q1: 'yes', q2: 'SKIPPED' }, { q1: '', q2: '' }),
    ).toStrictEqual({ q1: 'yes', q2: 'SKIPPED' });
  });
});

describe('withPostSurveyAnswers', () => {
  const specs = [
    {
      insightsObject: InsightsObject.Conversations,
      attributeName: 'conversation_attribute_5',
      questions: ['q1', 'q2'],
    },
  ];
  const baseAttributes = {
    isSurveyTask: true,
    contactTaskId: 'WTcontact',
    conversations: { conversation_id: 'WTcontact' },
  };

  test('stores the raw answers and their Insights representation', () => {
    expect(withPostSurveyAnswers(specs, baseAttributes, { q1: 'yes' })).toStrictEqual({
      ...baseAttributes,
      conversations: { conversation_id: 'WTcontact', conversation_attribute_5: 'yes;' },
      customers: {},
      postSurveyAnswers: { q1: 'yes' },
    });
  });

  test('applying it again with more answers replaces the previous Insights values', () => {
    const once = withPostSurveyAnswers(specs, baseAttributes, { q1: 'yes' });
    expect(withPostSurveyAnswers(specs, once, { q1: 'yes', q2: 'no' })).toStrictEqual({
      ...baseAttributes,
      conversations: { conversation_id: 'WTcontact', conversation_attribute_5: 'yes;no' },
      customers: {},
      postSurveyAnswers: { q1: 'yes', q2: 'no' },
    });
  });
});
