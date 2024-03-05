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

import type { Case } from 'plugin-hrm-form/src/types/types';
import flexContext from '../../flex-in-a-box/global-context';
import { addSeconds, subHours } from 'date-fns';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DefinitionVersionId } from 'hrm-form-definitions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';
import * as path from 'path';

const generateMockCases = (toGenerate: number): Case[] => {
  const hourAgo = subHours(new Date(), 10);
  return Object.keys(new Array(toGenerate).fill(null)).map((idx) => {
    const idxNumber = Number.parseInt(idx);
    let sectionIdx = 0;
    const time = addSeconds(hourAgo, idxNumber);
    return {
      accountSid: flexContext.ACCOUNT_SID,
      id: idxNumber.toString(),
      status: 'open',
      helpline: 'Fake Helpline',
      twilioWorkerId: flexContext.LOGGED_IN_WORKER_SID,
      categories: {
        'case category 1': ['subcategory1', 'subcategory2'],
        'case category 2': ['subcategory3'],
      },
      info: {
        definitionVersion: DefinitionVersionId.demoV1,
        counsellorNotes: [
          {
            id: `note-${sectionIdx++}`,
            createdAt: time.toISOString(),
            twilioWorkerId: flexContext.LOGGED_IN_WORKER_SID,
            text: `Note ${sectionIdx} (Case ${idxNumber})`,
          },
        ],
      },
      createdAt: time.toISOString(),
      updatedAt: time.toISOString(),
      connectedContacts: [
        {
          id: idxNumber.toString(),
          twilioWorkerId: flexContext.LOGGED_IN_WORKER_SID,
          number: sectionIdx.toString().padEnd(8, '0'),
          conversationDuration: 100,
          csamReports: [],
          createdBy: flexContext.LOGGED_IN_WORKER_SID,
          helpline: 'Fake Helpline',
          taskId: `TK${sectionIdx}`,
          channel: 'web',
          timeOfContact: time.toISOString(),
          updatedAt: time.toISOString(),
          updatedBy: flexContext.LOGGED_IN_WORKER_SID,
          queueName: 'Fake Queue',
          channelSid: `CH${sectionIdx}`,
          serviceSid: 'SIxxx',
          rawJson: {
            callType: 'Child calling about self',
            childInformation: {
              firstName: 'Lorna',
              lastName: 'Ballantyne',
            },
            callerInformation: {},
            caseInformation: {
              categories: {
                'contact category 1': ['subcategory 1'],
                'contact category 2': ['subcategory 2', 'subcategory 3'],
              },
            },
            conversationMedia: [],
            contactlessTask: {
              channel: 'web',
            },
          },
        },
      ],
    };
  });
};

let newCaseId = 0;

const hrmCases = () => {
  const PATH_PREFIX = `/v0/accounts/${flexContext.ACCOUNT_SID}/cases`;
  const mockCases: Case[] = generateMockCases(55);

  return {
    getMockCases: (): Case[] => mockCases,
    mockCaseEndpoints: async (page: Page) => {
      await page.route(
        new URL(path.join(PATH_PREFIX, '*'), context.HRM_BASE_URL).toString(),
        async (route) => {
          if (route.request().method().toUpperCase() === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(route.request().postDataJSON()),
            });
          } else if (
            route.request().method().toUpperCase() === 'GET' &&
            route
              .request()
              .url()
              .match(/\/\d+$/g)
          ) {
            const caseId = route.request().url().split('/')[
              route.request().url().split('/').length - 1
            ];

            const cas = mockCases.find((c) => c.id === caseId);

            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(cas),
            });
          } else {
            await route.continue();
          }
        },
      );
      await page.route(new URL(PATH_PREFIX, context.HRM_BASE_URL).toString(), async (route) => {
        switch (route.request().method().toUpperCase()) {
          case 'POST': {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ ...route.request().postDataJSON(), id: newCaseId++ }),
            });
            return;
          }
          case 'DELETE': {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
            });
            return;
          }
        }
      });
      await page.route(
        new URL(path.join(PATH_PREFIX, 'search**'), context.HRM_BASE_URL).toString(),
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              cases: mockCases.slice(0, 10),
              count: mockCases.length,
            }),
          });
        },
      );
    },
  };
};

export default hrmCases;
