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

import each from 'jest-each';

import { AppRoutes, CaseItemAction, RoutingState } from '../../../states/routing/types';
import { standaloneTaskSid } from '../../../types/types';
import { initialState } from '../../../states/routing/reducer';
import {
  getCurrentBaseRoute,
  getCurrentTopmostRouteForTask,
  getCurrentTopmostRouteStackForTask,
} from '../../../states/routing/getRoute';

type TestCase<T extends AppRoutes | AppRoutes[]> = {
  state: RoutingState;
  expected: T;
  description: string;
};

const stateWithRouteStack = (baseRoutes: AppRoutes[]): RoutingState => ({
  tasks: {
    1: baseRoutes,
    [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
  },
});

describe('getCurrentTopmostRouteStackForTask', () => {
  const testCases: TestCase<AppRoutes[]>[] = [
    {
      description: 'No modals open - should return the base route a task',
      state: stateWithRouteStack([
        { route: 'case-list', subroute: 'case-list' },
        { route: 'case', subroute: 'home' },
      ]),
      expected: [
        { route: 'case-list', subroute: 'case-list' },
        { route: 'case', subroute: 'home' },
      ],
    },
    {
      description: 'Modal open - should return the modal route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            { route: 'case', subroute: 'home' },
            { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
          ],
        },
      ]),
      expected: [
        { route: 'case', subroute: 'home' },
        { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
      ],
    },
    {
      description: 'Stacked modal open - should return the top modal route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
              activeModal: [
                { route: 'case', subroute: 'household', action: CaseItemAction.View, id: 'x' },
                { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
              ],
            },
          ],
        },
      ]),
      expected: [
        { route: 'case', subroute: 'household', action: CaseItemAction.View, id: 'x' },
        { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
      ],
    },
    {
      description: "Modal open in history - shouldn't really happen, ignore it",
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
            },
          ],
        },
        { route: 'search', subroute: 'form' },
      ]),
      expected: [
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
            },
          ],
        },
        { route: 'search', subroute: 'form' },
      ],
    },
  ];

  each(testCases).test('$description', ({ state, expected }) => {
    expect(getCurrentTopmostRouteStackForTask(state, '1')).toEqual(expected);
  });
});

describe('getCurrentTopmostRouteForTask', () => {
  const testCases: TestCase<AppRoutes>[] = [
    {
      description: 'No modals open - should return the current base route a task',
      state: stateWithRouteStack([
        { route: 'case-list', subroute: 'case-list' },
        { route: 'case', subroute: 'home' },
      ]),
      expected: { route: 'case', subroute: 'home' },
    },
    {
      description: 'Modal open - should return the modal route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            { route: 'case', subroute: 'home' },
            { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
          ],
        },
      ]),
      expected: { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
    },
    {
      description: 'Stacked modal open - should return the top modal route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
              activeModal: [
                { route: 'case', subroute: 'household', action: CaseItemAction.View, id: 'x' },
                { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
              ],
            },
          ],
        },
      ]),
      expected: { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
    },
    {
      description: "Modal open in history - shouldn't really happen, ignore it",
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
            },
          ],
        },
        { route: 'search', subroute: 'form' },
      ]),
      expected: { route: 'search', subroute: 'form' },
    },
    {
      description: "Top modal stack is empty - shouldn't really happen, return undefined",
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
              activeModal: [],
            },
          ],
        },
      ]),
      expected: undefined,
    },
  ];

  each(testCases).test('$description', ({ state, expected }) => {
    expect(getCurrentTopmostRouteForTask(state, '1')).toEqual(expected);
  });
});

describe('getCurrentBaseRouteForTask', () => {
  const testCases: TestCase<AppRoutes>[] = [
    {
      description: 'No modals open - should return the current base route a task',
      state: stateWithRouteStack([
        { route: 'case-list', subroute: 'case-list' },
        { route: 'case', subroute: 'home' },
      ]),
      expected: { route: 'case', subroute: 'home' },
    },
    {
      description: 'Modal open - should still return the current base route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            { route: 'case', subroute: 'home' },
            { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
          ],
        },
      ]),
      expected: {
        route: 'case-list',
        subroute: 'case-list',
        activeModal: [
          { route: 'case', subroute: 'home' },
          { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '' },
        ],
      },
    },
    {
      description: 'Stacked modal open - should still return the current base route',
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
              activeModal: [
                { route: 'case', subroute: 'household', action: CaseItemAction.View, id: 'x' },
                { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
              ],
            },
          ],
        },
      ]),
      expected: {
        route: 'case-list',
        subroute: 'case-list',
        activeModal: [
          {
            route: 'case',
            subroute: 'home',
            activeModal: [
              { route: 'case', subroute: 'household', action: CaseItemAction.View, id: 'x' },
              { route: 'case', subroute: 'household', action: CaseItemAction.Edit, id: 'x' },
            ],
          },
        ],
      },
    },
    {
      description: "Modal open in history - shouldn't really happen, ignore it",
      state: stateWithRouteStack([
        {
          route: 'case-list',
          subroute: 'case-list',
          activeModal: [
            {
              route: 'case',
              subroute: 'home',
            },
          ],
        },
        { route: 'search', subroute: 'form' },
      ]),
      expected: { route: 'search', subroute: 'form' },
    },
    {
      description: "Bsse modal stack is empty - shouldn't really happen, return undefined",
      state: stateWithRouteStack([]),
      expected: undefined,
    },
  ];

  each(testCases).test('$description', ({ state, expected }) => {
    expect(getCurrentBaseRoute(state, '1')).toEqual(expected);
  });
});
