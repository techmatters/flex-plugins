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

type FormContents = {
  childInformation: Record<string, string>;
  categories: Record<string, string[]>;
  caseInformation: Record<string, string>;
  callType?: string;
  channelOverrides?: Record<string, Partial<Exclude<FormContents, 'channelOverrides'>>>;
};

const e2eBaseContent = {
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
    callSummary: 'E2E TEST PREPOPULATED FORM',
  },
};

const formContentsByHelpline: Record<string, FormContents> = {
  e2e: {
    ...e2eBaseContent,
    channelOverrides: {
      voice: {
        callType: 'child',
      },
      sms: {
        childInformation: {
          ...e2eBaseContent.childInformation,
          gender: 'Unknown',
          age: 'Unknown',
        },
        caseInformation: {
          callSummary: 'E2E TEST EMPTY FORM',
        },
      },
      offline: {
        callType: 'child',
        childInformation: {
          ...e2eBaseContent.childInformation,
          gender: 'Unknown',
          age: 'Unknown',
        },
        caseInformation: {
          callSummary: 'E2E TEST EMPTY FORM',
        },
      },
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
    channelOverrides: {},
  },
  usnm: {
    childInformation: {
      zipCode: '1234',
    },
    categories: {
      Education: ['Disability Rights for Education'],
    },
    caseInformation: {
      transferredTo988: 'No',
    },
    callType: 'child',
    channelOverrides: {},
  },
};

export const getFormContents = (
  helpline: keyof typeof formContentsByHelpline,
  channel?: string,
) => {
  const { channelOverrides, ...formContent } = formContentsByHelpline[helpline];
  return {
    ...formContent,
    ...(channel ? channelOverrides?.[channel] ?? {} : {}),
  };
};
