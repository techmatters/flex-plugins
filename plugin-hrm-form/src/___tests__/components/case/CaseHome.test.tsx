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

// @ts-ignore
import React from 'react';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';
import { render, screen } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import each from 'jest-each';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import CaseHome, { CaseHomeProps } from '../../../components/case/CaseHome';
import { Case, CustomITask } from '../../../types/types';
import { getDefinitionVersions } from '../../../hrmConfig';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { RootState } from '../../../states';
import { VALID_EMPTY_CASE } from '../../testCases';
import { FullCaseSection } from '../../../services/caseSectionService';
import { TaskSID } from '../../../types/twilio';
import { CaseStateEntry } from '../../../states/case/types';

jest.mock('../../../permissions', () => ({
  ...jest.requireActual('../../../permissions'),
  getInitializedCan: jest.fn(() => () => true),
}));

// Called by the <Timeline/> subcomponent
jest.mock('../../../services/CaseService', () => ({
  getCaseTimeline: jest.fn(() => Promise.resolve({ activities: [], count: 0 })),
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();
const TASK_SID: TaskSID = 'WT-task1';
const mockStore = configureMockStore([]);

const entry = {
  firstName: 'first',
  lastName: 'last',
  streetAddress: 'street',
  city: 'city',
  stateOrCounty: 'state',
  postalCode: 'code',
  phone1: 'phone1',
  phone2: 'phone2',
  age: 'age',
  ethnicity: 'ethnicity',
  gender: 'gender',
  language: 'language',
  nationality: 'nationality',
  relationshipToChild: 'relationshipToChild',
};

const perpetratorEntry: FullCaseSection = {
  sectionId: 'PERPETRATOR_ID',
  sectionType: 'perpetrator',
  sectionTypeSpecificData: entry,
  createdAt: new Date('2020-06-29T22:26:00.208Z'),
  eventTimestamp: new Date('2020-06-29T22:26:00.208Z'),
  createdBy: 'WK-worker1',
};
const householdEntry: FullCaseSection = {
  sectionId: 'HOUSEHOLD_ID',
  sectionType: 'household',
  sectionTypeSpecificData: entry,
  createdAt: new Date('2020-06-29T22:26:00.208Z'),
  eventTimestamp: new Date('2020-06-29T22:26:00.208Z'),
  createdBy: 'WK-worker1',
};

function createState(state: RecursivePartial<RootState['plugin-hrm-form']>): RootState {
  return {
    [namespace]: state,
  } as RootState;
}

let ownProps: CaseHomeProps;

let mockV1;
let initialState: RootState;
let caseDetails: Case;
let sections: CaseStateEntry['sections'];
let timelines: CaseStateEntry['timelines'];

describe('useState mocked', () => {
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    mockReset();
    caseDetails = {
      ...VALID_EMPTY_CASE,
      id: 'case123',
      info: {
        childIsAtRisk: false,
        summary: '',
        followUpDate: '',
      },
      status: 'open',
      createdAt: '2020-06-29T22:26:00.208Z',
    };
    sections = {
      household: {},
      incident: {},
      perpetrator: {},
      document: {},
      note: {},
      referral: {},
    };
    timelines = {
      'prime-timeline': [],
      perpetrator: [],
      household: [],
    };
    initialState = createState({
      configuration: {
        counselors: {
          list: [],
          hash: { worker1: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
      activeContacts: {
        existingContacts: {
          contact1: {
            metadata: {},
            savedContact: {
              ...VALID_EMPTY_CONTACT,
              rawJson: {
                ...VALID_EMPTY_CONTACT.rawJson,
                childInformation: {
                  firstName: 'first',
                  lastName: 'last',
                },
                caseInformation: {
                  callSummary: 'contact call summary',
                },
                categories: {},
              },
              taskId: TASK_SID,
              caseId: 'case123',
            },
          },
        },
      },
      connectedCase: {
        cases: {
          case123: {
            connectedCase: caseDetails,
            timelines,
            sections,
          },
        },
      },
      routing: {
        tasks: {
          [TASK_SID]: [
            {
              route: 'tabbed-forms',
              subroute: 'categories',
              activeModal: [{ route: 'case', subroute: 'home', caseId: 'case123' }],
            },
          ],
        },
      },
    });

    const setState = jest.fn();
    const useStateMock = initState => [initState, setState];

    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    ownProps = {
      task: { taskSid: TASK_SID as TaskSID } as CustomITask,
      definitionVersion: mockV1,
      can: () => true,
      handleClose: jest.fn(),
      handleSaveAndEnd: jest.fn(),
      handlePrintCase: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('click Add Note button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByText('Case-Note').click();
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Note,
        action: CaseItemAction.Add,
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  test('click Add Referral button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByText('Case-Referral').click();
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Referral,
        action: CaseItemAction.Add,
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  test('click Add Household Information button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByText('Case-Household').click();
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Household,
        action: CaseItemAction.Add,
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  test('click Add Perpetrator button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByText('Case-Perpetrator').click();
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Perpetrator,
        action: CaseItemAction.Add,
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  test('click View Household button', async () => {
    sections.household[householdEntry.sectionId] = householdEntry;
    timelines.household = [
      {
        activity: { sectionId: householdEntry.sectionId, sectionType: 'household' },
        activityType: 'case-section-id',
        timestamp: householdEntry.eventTimestamp,
      },
    ];
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('Case-InformationRow-ViewButton').click();

    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Household,
        action: CaseItemAction.View,
        id: 'HOUSEHOLD_ID',
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  test('click View Perpetrator button', async () => {
    sections.perpetrator[perpetratorEntry.sectionId] = perpetratorEntry;
    timelines.perpetrator = [
      {
        activity: { sectionId: perpetratorEntry.sectionId, sectionType: 'perpetrator' },
        activityType: 'case-section-id',
        timestamp: perpetratorEntry.eventTimestamp,
      },
    ];
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('Case-InformationRow-ViewButton').click();

    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.Perpetrator,
        action: CaseItemAction.View,
        id: 'PERPETRATOR_ID',
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  // CaseSummary still changes case in redux directly rather than delegating to top level component
  test('click edit case button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByText('Case-EditButton').click();
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'case',
        caseId: 'case123',
        subroute: NewCaseSubroutes.CaseSummary,
        action: CaseItemAction.Edit,
        id: '',
      },
      taskId: TASK_SID,
      type: 'routing/open-modal',
    });
  });

  each([true, false]).test('Click close button on case', async isCreating => {
    const store = mockStore({
      [namespace]: {
        ...initialState[namespace],
        routing: {
          tasks: {
            [TASK_SID]: [
              {
                ...initialState[namespace].routing.tasks[TASK_SID][0],
                activeModal: [{ route: 'case', subroute: 'home', caseId: 'case123', isCreating }],
              },
            ],
          },
        },
      },
    });

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('NavigableContainer-CloseCross').click();
    expect(ownProps.handleClose).toHaveBeenCalled();
  });
});
