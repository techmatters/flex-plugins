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

import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import each from 'jest-each';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockGetDefinitionsResponse, mockPartialConfiguration } from '../../mockGetConfig';
import { getDefinitionVersions } from '../../../hrmConfig';
import { initialState, newTaskEntry, reduce } from '../../../states/routing/reducer';
import * as actions from '../../../states/routing/actions';
import * as GeneralActions from '../../../states/actions';
import { standaloneTaskSid } from '../../../types/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import {
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
} from '../../../states/contacts/types';
import {
  AppRoutes,
  CaseItemAction,
  ChangeRouteMode,
  RoutingActionType,
  RoutingState,
} from '../../../states/routing/types';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const task = { taskSid: 'WT-task1' };

const offlineContactTaskSid = 'offline-contact-task-workerSid';
mockPartialConfiguration({ workerSid: 'workerSid' });

let mockV1: DefinitionVersion;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

beforeEach(() => {
  mockReset();
});

describe('test reducer (specific actions)', () => {
  const stateWithTask: RoutingState = {
    tasks: {
      'WT-task1': [{ route: 'tabbed-forms', subroute: 'childInformation' }],
      [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
    },
    isAddingOfflineContact: false,
  };

  test('should return initial state', async () => {
    const expected = initialState;

    const result = reduce(undefined, {} as any);
    expect(result).toStrictEqual(expected);
  });

  test('should handle CREATE_CONTACT_ACTION_FULFILLED', async () => {
    const expected = {
      tasks: {
        'WT-task1': [{ route: 'tabbed-forms', subroute: 'childInformation' }],
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(initialState, {
      type: CREATE_CONTACT_ACTION_FULFILLED,
      payload: {
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: task.taskSid,
        },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);
  });

  type TestCase = {
    startingState: RoutingState;
    expected: RoutingState;
    action: RoutingActionType;
    description: string;
  };

  const genericRoutingTest = async ({ startingState, expected, action }: TestCase) => {
    const result = reduce(startingState, action);
    expect(result).toStrictEqual(expected);
  };

  const stateWithRouteStack = (baseRoutes: AppRoutes[]): RoutingState => ({
    tasks: {
      'WT-task1': baseRoutes,
      [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
    },
    isAddingOfflineContact: false,
  });

  describe('CHANGE_ROUTE action', () => {
    const tests = (stateGenerator: (routes: AppRoutes[]) => RoutingState, routeDescription: string) => [
      {
        startingState: stateGenerator([
          { route: 'tabbed-forms', subroute: 'childInformation' },
          { route: 'case', subroute: 'home', caseId: '' },
        ]),
        expected: stateGenerator([
          { route: 'tabbed-forms', subroute: 'childInformation' },
          { route: 'case', subroute: 'home', caseId: '' },
          { route: 'tabbed-forms' },
        ]),
        action: actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid),
        description: `should add new route to the ${routeDescription} stack if mode is Push`,
      },
      {
        startingState: stateGenerator([
          { route: 'tabbed-forms', subroute: 'childInformation' },
          { route: 'case', subroute: 'home', caseId: '' },
        ]),
        expected: stateGenerator([{ route: 'tabbed-forms', subroute: 'childInformation' }, { route: 'tabbed-forms' }]),
        action: actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid, ChangeRouteMode.Replace),
        description: `should replace the most recent ${routeDescription} route with new route to stack if mode is Replace`,
      },
      {
        startingState: stateGenerator([
          { route: 'tabbed-forms', subroute: 'childInformation' },
          { route: 'case', subroute: 'home', caseId: '' },
        ]),
        expected: stateGenerator([{ route: 'tabbed-forms' }]),
        action: actions.changeRoute({ route: 'tabbed-forms' }, task.taskSid, ChangeRouteMode.ResetModal),
        description: `should replace the whole ${routeDescription} route with a new stack containing the new route as the only item if mode is Reset`,
      },
    ];
    describe('Not currently in a modal', () => {
      each([...tests(stateWithRouteStack, 'base')]).test('$description', genericRoutingTest);
    });

    describe('When modal is open', () => {
      const stateWithModal = (modalRoutes: AppRoutes[]): RoutingState => ({
        tasks: {
          'WT-task1': [
            {
              route: 'tabbed-forms',
              subroute: 'childInformation',
              activeModal: modalRoutes,
            },
          ],
          [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
        },
        isAddingOfflineContact: false,
      });

      each([...tests(stateWithModal, 'modal')]).test('$description', genericRoutingTest);
    });
  });

  describe('OPEN_MODAL action', () => {
    const tests: TestCase[] = [
      {
        description:
          'Current route not in a modal - should create activeModal on latest route in base stack with the provided route as the only item',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
        ]),
        action: actions.newOpenModalAction({ route: 'case', subroute: 'home', caseId: '' }, task.taskSid),
      },
      {
        description:
          "Current route in a modal - should create activeModal on latest route in the top modal's stack with the provided route as the only item",
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              { route: 'search', subroute: 'case-results', contactsPage: 0, casesPage: 0 },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
              },
            ],
          },
        ]),
        action: actions.newOpenModalAction({ route: 'case', subroute: 'home', caseId: '' }, task.taskSid),
      },
      {
        description:
          "Current route has active modal on a previous route (shouldn't happen) - should still create activeModal on latest route in base stack",
        startingState: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        expected: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
        ]),
        action: actions.newOpenModalAction({ route: 'case', subroute: 'home', caseId: '' }, task.taskSid),
      },
    ];

    each(tests).test('$description', genericRoutingTest);
  });

  describe('GO_BACK action', () => {
    const tests: TestCase[] = [
      {
        description: 'Current route not in a modal - should pop the latest route from the base stack',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        expected: stateWithRouteStack([{ route: 'select-call-type' }]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description: 'Current route in a modal - should pop the latest route from the modal stack',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              { route: 'search', subroute: 'case-results', contactsPage: 0, casesPage: 0 },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'search', subroute: 'form' }],
          },
        ]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description: 'Current route in a stack of modals - should pop the latest route from the top modal stack',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [
                  { route: 'case', subroute: 'home', caseId: '' },
                  { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, caseId: '', id: '' },
                ],
              },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
              },
            ],
          },
        ]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description:
          "Current route has active modal on a previous route (shouldn't happen) - should still pop the latest route from the base stack",
        startingState: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        expected: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
        ]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description: 'Current route is the only route in the base stack - should do nothing',
        startingState: stateWithRouteStack([
          { route: 'csam-report', subroute: 'status', previousRoute: { route: 'select-call-type' } },
        ]),
        expected: stateWithRouteStack([
          { route: 'csam-report', subroute: 'status', previousRoute: { route: 'select-call-type' } },
        ]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description: 'Current route is the only route in the base stack and supports modals - should do nothing',
        startingState: stateWithRouteStack([{ route: 'tabbed-forms', subroute: 'childInformation' }]),
        expected: stateWithRouteStack([{ route: 'tabbed-forms', subroute: 'childInformation' }]),
        action: actions.newGoBackAction(task.taskSid),
      },
      {
        description: 'Current route is the only route in the modal stack - should close modal',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [{ route: 'case', subroute: 'home', caseId: '' }],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        action: actions.newGoBackAction(task.taskSid),
      },
    ];
    each(tests).test('$description', genericRoutingTest);
  });

  describe('CLOSE_MODAL action', () => {
    const tests: TestCase[] = [
      {
        description: 'Current route not in a modal - should do nothing',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        action: actions.newCloseModalAction(task.taskSid),
      },
      {
        description: 'Current route in a modal - should close the modal',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              { route: 'search', subroute: 'case-results', contactsPage: 0, casesPage: 0 },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          { route: 'tabbed-forms', subroute: 'childInformation' },
        ]),
        action: actions.newCloseModalAction(task.taskSid),
      },
      {
        description: 'Current route in a stack of modals - should close the top modal',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [
                  { route: 'case', subroute: 'home', caseId: '' },
                  { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, id: '', caseId: '' },
                ],
              },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              { route: 'search', subroute: 'case-results', contactsPage: 0, casesPage: 0 },
            ],
          },
        ]),
        action: actions.newCloseModalAction(task.taskSid),
      },
      {
        description:
          'Current route in a stack of modals & topRoute set - should close all modals above the one where topRoute is the latest route',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [
                  { route: 'case', subroute: 'home', caseId: '' },
                  { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, caseId: '', id: '' },
                ],
              },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
          },
        ]),
        action: actions.newCloseModalAction(task.taskSid, 'tabbed-forms'),
      },
      {
        description: 'Current route in a stack of modals & topRoute set to current top modal route - should do nothing',
        startingState: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [
                  { route: 'case', subroute: 'home', caseId: '' },
                  { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, caseId: '', id: '' },
                ],
              },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          { route: 'select-call-type' },
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'search', subroute: 'form' },
              {
                route: 'search',
                subroute: 'case-results',
                contactsPage: 0,
                casesPage: 0,
                activeModal: [
                  { route: 'case', subroute: 'home', caseId: '' },
                  { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, caseId: '', id: '' },
                ],
              },
            ],
          },
        ]),
        action: actions.newCloseModalAction(task.taskSid, 'case'),
      },
      {
        // This behaviour is probably not the most logical behaviour, but it simplifies the algorithm,
        // so until we have a use case for changing it, this is what it does
        description:
          'topRoute is the latest route in more than one layer - should close down to the lowest matching route',
        startingState: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
            activeModal: [
              { route: 'select-call-type' },
              {
                route: 'tabbed-forms',
                subroute: 'childInformation',
                activeModal: [
                  { route: 'search', subroute: 'form' },
                  {
                    route: 'search',
                    subroute: 'case-results',
                    contactsPage: 0,
                    casesPage: 0,
                    activeModal: [
                      { route: 'case', subroute: 'home', caseId: '' },
                      { route: 'case', subroute: 'caseSummary', action: CaseItemAction.View, caseId: '', id: '' },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
        expected: stateWithRouteStack([
          {
            route: 'tabbed-forms',
            subroute: 'childInformation',
          },
        ]),
        action: actions.newCloseModalAction(task.taskSid, 'tabbed-forms'),
      },
    ];
    each(tests).test('$description', genericRoutingTest);
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = initialState;

    const result = reduce(stateWithTask, GeneralActions.removeContactState(task.taskSid, ''));
    expect(result).toStrictEqual(expected);
  });

  test('should handle LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED and recreate the state as loaded', async () => {
    const expected = {
      tasks: {
        'WT-task1': [{ route: 'tabbed-forms', subroute: 'childInformation' }],
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(initialState, {
      type: LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
      payload: {
        contact: { ...VALID_EMPTY_CONTACT, taskId: task.taskSid },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);
  });

  test('should handle LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED and do nothing', async () => {
    const expected = {
      tasks: {
        'WT-task1': [{ route: 'case', subroute: 'home', caseId: '' }],
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result1 = reduce(
      stateWithTask,
      actions.changeRoute({ route: 'case', subroute: 'home', caseId: '' }, task.taskSid, ChangeRouteMode.Replace),
    );

    const result2 = reduce(result1, {
      type: LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
      payload: {
        contact: { ...VALID_EMPTY_CONTACT, taskId: task.taskSid },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result2).toStrictEqual(expected);
  });

  test('should handle LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED and change isAddingOfflineContact to true', async () => {
    const expected = {
      tasks: {
        'WT-task1': [{ route: 'tabbed-forms', subroute: 'childInformation' }],
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
        [offlineContactTaskSid]: [{ ...newTaskEntry, route: 'tabbed-forms', subroute: 'childInformation' }],
      },
      isAddingOfflineContact: true,
    };

    const result = reduce(stateWithTask, {
      type: LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
      payload: {
        contact: {
          ...VALID_EMPTY_CONTACT,
          taskId: offlineContactTaskSid,
          rawJson: {
            ...VALID_EMPTY_CONTACT.rawJson,
            contactlessTask: {
              ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
              createdOnBehalfOf: 'workerSid',
            },
          },
        },
        metadata: VALID_EMPTY_METADATA,
      },
    } as any);
    expect(result).toStrictEqual(expected);
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = {
      tasks: {
        'WT-task1': [{ route: 'tabbed-forms', subroute: 'childInformation' }],
        [standaloneTaskSid]: initialState.tasks[standaloneTaskSid],
      },
      isAddingOfflineContact: false,
    };

    const result = reduce(
      {
        tasks: {
          ...stateWithTask.tasks,
          [offlineContactTaskSid]: [{ route: 'tabbed-forms', subroute: 'childInformation' }],
        },
        isAddingOfflineContact: true,
      },
      GeneralActions.removeContactState(offlineContactTaskSid, ''),
    );
    expect(result).toStrictEqual(expected);
  });
});
