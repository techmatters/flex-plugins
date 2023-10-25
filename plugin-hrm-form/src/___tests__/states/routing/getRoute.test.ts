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
  isAddingOfflineContact: false,
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
