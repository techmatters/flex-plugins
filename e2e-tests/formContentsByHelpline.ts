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

export const formContentsByHelpline = {
  e2e: {
    childInformation: {
      firstName: 'E2E',
      lastName: 'TEST',
      phone1: '1234512345',
      province: 'Northern',
      district: 'District A',
    },
    categories: {
      Accessibility: ['Education'],
    },
    caseInformation: {
      callSummary: 'E2E TEST CALL',
    },
  },
  ca: {
    childInformation: {
      nickname: 'E2E',
      gender: 'Unknown',
      province: 'Manitoba',
      ethnicity: 'Black',
      indigenousGroup: 'N/A',
      school: 'College',
      livingSituation: 'Rural area',
      Newcomer: 'No',
      upset: '1',
      supportType: 'Unknown',
      suicidalThoughts: 'No',
      homicidalThoughts: 'No',
      experiencingAbuse: 'No',
    },
    categories: {
      Identity: ['Neurodivergence'],
    },
    caseInformation: {
      contactType: 'Testing',
    },
  },
};
