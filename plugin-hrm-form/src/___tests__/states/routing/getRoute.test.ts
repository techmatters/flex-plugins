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
  selectIsQueueGreetingOpen,
} from '../../../states/routing/getRoute';
import { RootState } from '../../../states';
import { namespace } from '../../../states/storeNamespaces';

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

describe('selectIsQueueGreetingOpen', () => {
  const task = { sid: 'WR1', taskSid: 'WT1' };
  const rootState = ({
    standaloneRoute = 'agent-desktop',
    selectedTaskSid = 'WR1',
    dismissedQueueGreetings = {},
  }: {
    standaloneRoute?: string;
    selectedTaskSid?: string;
    dismissedQueueGreetings?: RoutingState['dismissedQueueGreetings'];
  }) =>
    (({
      flex: { view: { selectedTaskSid } },
      [namespace]: {
        routing: {
          tasks: { [standaloneTaskSid]: [{ route: standaloneRoute }] },
          dismissedQueueGreetings,
        },
      },
    } as unknown) as RootState);

  test('is open on the agent desktop when the task is selected and the greeting was not dismissed', () => {
    expect(selectIsQueueGreetingOpen(rootState({}), task)).toBe(true);
  });

  each([
    { description: 'another view is shown', state: rootState({ standaloneRoute: 'case-list' }) },
    { description: 'another task is selected', state: rootState({ selectedTaskSid: 'WR2' }) },
    { description: 'the greeting was dismissed', state: rootState({ dismissedQueueGreetings: { WT1: true } }) },
  ]).test('is closed when $description', ({ state }) => {
    expect(selectIsQueueGreetingOpen(state, task)).toBe(false);
  });
});
