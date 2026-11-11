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

import {
  InsightsObject,
  LegacyOneToManyConfigSpec,
} from '@tech-matters/hrm-form-definitions';
import { buildDataObject } from '../../../src/postSurvey/postSurveyData';

const specs: LegacyOneToManyConfigSpec[] = [
  {
    insightsObject: InsightsObject.Customers,
    attributeName: 'survey1',
    questions: ['q1', 'q2'],
  },
  {
    insightsObject: InsightsObject.Conversations,
    attributeName: 'survey2',
    questions: ['q3'],
  },
];

describe('buildDataObject', () => {
  test('returns the answer for every question in the specs', () => {
    expect(buildDataObject(specs, { q1: 'yes', q2: 3, q3: 'no' })).toStrictEqual({
      q1: 'yes',
      q2: 3,
      q3: 'no',
    });
  });

  test('uses an empty string for unanswered questions', () => {
    expect(buildDataObject(specs, { q2: 'maybe' })).toStrictEqual({
      q1: '',
      q2: 'maybe',
      q3: '',
    });
  });

  test('ignores answers to questions not in the specs', () => {
    expect(buildDataObject(specs, { q1: 'yes', other: 'ignored' })).toStrictEqual({
      q1: 'yes',
      q2: '',
      q3: '',
    });
  });
});
