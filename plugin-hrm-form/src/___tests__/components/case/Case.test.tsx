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

/* eslint-disable no-empty-function */
// @ts-ignore
import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockGetDefinitionsResponse, mockPartialConfiguration } from '../../mockGetConfig';
import Case from '../../../components/case';
import { HrmState, RootState } from '../../../states';
import { getDefinitionVersions } from '../../../hrmConfig';
import { Contact, StandaloneITask, standaloneTaskSid } from '../../../types/types';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { RecursivePartial } from '../../RecursivePartial';
import { namespace } from '../../../states/storeNamespaces';
import { CaseStateEntry } from '../../../states/case/types';
import { TaskSID, WorkerSID } from '../../../types/twilio';
import { VALID_EMPTY_CASE } from '../../testCases';
import { newGetTimelineAsyncAction } from '../../../states/case/timeline';

jest.mock('../../../services/CaseService', () => ({
  getActivities: jest.fn(() => []),
  cancelCase: jest.fn(),
  getCase: jest.fn(),
}));
jest.mock('../../../permissions', () => ({
  getInitializedCan: jest.fn(() => () => true),
  PermissionActions: {},
}));
jest.mock('../../../states/case/timeline', () => ({
  newGetTimelineAsyncAction: jest.fn(),
  selectTimelineCount: jest.fn(() => 0),
  selectTimeline: jest.fn(() => []),
}));

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);
const mockNewGetTimelineAction = newGetTimelineAsyncAction as jest.MockedFunction<typeof newGetTimelineAsyncAction>;

function createState(state: RecursivePartial<HrmState>): RootState {
  return {
    [namespace]: state,
  } as RootState;
}

let ownProps;

let mockV1;
let initialState: RootState;
const TASK_SID: TaskSID = 'WT-taskSid';
const CURRENT_WORKER_SID: WorkerSID = 'WK-current-worker-sid';
const WORKER_SID: WorkerSID = 'WK-worker1';
const BASELINE_DATE = new Date('2020-06-29T22:26:00.208Z');

beforeEach(() => {
  mockReset();
});

describe('useState mocked', () => {
  const verifyTimelineActions = () => {
    ['household', 'incident', 'perpetrator'].forEach(sectionType => {
      expect(mockNewGetTimelineAction).toHaveBeenCalledWith(case1.connectedCase.id, sectionType, [sectionType], false, {
        limit: 100,
        offset: 0,
      });
    });

    expect(mockNewGetTimelineAction).toHaveBeenCalledWith(
      case1.connectedCase.id,
      'prime-timeline',
      expect.arrayContaining(['referral', 'note']),
      true,
      { limit: Number.MAX_SAFE_INTEGER, offset: 0 },
    );
  };

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
    mockPartialConfiguration({ workerSid: CURRENT_WORKER_SID });
  });

  const connectedContact: Contact = {
    ...VALID_EMPTY_CONTACT,
    id: 'contact1',
    rawJson: {
      ...VALID_EMPTY_CONTACT.rawJson,
      childInformation: {
        firstName: 'first',
        lastName: 'last',
      },
      caseInformation: {
        callSummary: 'contact call summary',
      },
      callerInformation: {},
      categories: {},
    },
    taskId: TASK_SID,
    caseId: 'case1',
  };

  const case1: CaseStateEntry = {
    connectedCase: {
      ...VALID_EMPTY_CASE,
      id: 'case1',
      createdAt: BASELINE_DATE.toISOString(),
      updatedAt: BASELINE_DATE.toISOString(),
      twilioWorkerId: WORKER_SID,
      status: 'open',
      info: { definitionVersion: DefinitionVersionId.v1 },
      categories: {},
      accountSid: 'AC-accountSid',
      helpline: 'helpline',
      firstContact: {
        id: 'contact1',
      } as Contact,
    },
    availableStatusTransitions: [],
    references: new Set(['x']),
    caseWorkingCopy: undefined,
    sections: {},
    timelines: {},
  };

  beforeEach(() => {
    initialState = createState({
      configuration: {
        counselors: {
          list: [],
          hash: { [WORKER_SID]: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
      activeContacts: {
        existingContacts: {},
      },
      connectedCase: {
        cases: {},
      },
      routing: { tasks: { [standaloneTaskSid]: [{ route: 'case', subroute: 'home', caseId: 'case1' }] } },
    });

    ownProps = {
      task: { taskSid: standaloneTaskSid } as StandaloneITask,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Case (should return null)', async () => {
    const store = mockStore(initialState);

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.queryByTestId('CaseHome-CaseDetailsComponent')).not.toBeInTheDocument();
  });

  test('Case (should render, no updated)', async () => {
    const store = mockStore(
      createState({
        ...initialState[namespace],
        connectedCase: {
          cases: { case1 },
        },
      }),
    );
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('case1');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe(
      BASELINE_DATE.toLocaleDateString(),
    );
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe('—');
    verifyTimelineActions();
  });

  test('Contact name should render once contact is saved to redux', async () => {
    const stateWithContact = createState({
      ...initialState[namespace],
      activeContacts: {
        ...initialState[namespace].activeContacts,
        existingContacts: {
          contact1: {
            savedContact: connectedContact,
            references: ['case-case1'],
          },
        },
      },
      connectedCase: {
        cases: { case1 },
      },
    });
    const store = mockStore(stateWithContact);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('case1');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe(
      BASELINE_DATE.toLocaleDateString(),
    );
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe('—');
    expect(screen.getByTestId('NavigableContainer-Title').innerHTML).toContain('first last');
  });

  test('Case (should render, after update)', async () => {
    const state: RootState = createState({
      ...initialState[namespace],
      connectedCase: {
        cases: {
          case1: {
            ...case1,
            connectedCase: { ...case1.connectedCase, updatedAt: '2020-06-29T22:29:00.208Z' },
          },
        },
      },
    });
    const store = mockStore(state);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('case1');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe(
      BASELINE_DATE.toLocaleDateString(),
    );
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe(
      BASELINE_DATE.toLocaleDateString(),
    );
    verifyTimelineActions();
  });

  test('a11y', async () => {
    const store = mockStore(initialState);

    const { container } = render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(container);

    (expect(results) as any).toHaveNoViolations();
  });
});
