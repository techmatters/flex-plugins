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
import { CustomITask, HouseholdEntry, PerpetratorEntry } from '../../../types/types';
import { CaseDetails } from '../../../states/case/types';
import { getDefinitionVersions } from '../../../hrmConfig';
import { CaseItemAction, NewCaseSubroutes } from '../../../states/routing/types';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { RootState } from '../../../states';

jest.mock('../../../permissions', () => ({
  ...jest.requireActual('../../../permissions'),
  getInitializedCan: jest.fn(() => true),
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

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

const perpetratorEntry: PerpetratorEntry = {
  id: 'PERPETRATOR_ID',
  perpetrator: entry,
  createdAt: '2020-06-29T22:26:00.208Z',
  twilioWorkerId: 'worker1',
};
const householdEntry: HouseholdEntry = {
  id: 'HOUSEHOLD_ID',
  household: entry,
  createdAt: '2020-06-29T22:26:00.208Z',
  twilioWorkerId: 'worker1',
};

function createState(state: RecursivePartial<RootState['plugin-hrm-form']>): RootState {
  return {
    [namespace]: state,
  } as RootState;
}

let ownProps: CaseHomeProps;

let mockV1;
let initialState: RootState;
let caseDetails: CaseDetails;

describe('useState mocked', () => {
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    mockReset();
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
              taskId: 'task1',
              caseId: 'case123',
            },
          },
        },
      },
      connectedCase: {
        cases: {
          case123: {
            connectedCase: {
              id: 'case123',
              createdAt: '2020-06-29T22:26:00.208Z',
              twilioWorkerId: 'worker1',
              status: 'open',
              info: { definitionVersion: DefinitionVersionId.v1 },
              connectedContacts: [],
            },
          },
        },
      },
      routing: {
        tasks: {
          task1: [
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

    caseDetails = {
      contactIdentifier: '',
      id: '0',
      households: [],
      incidents: [],
      perpetrators: [],
      documents: [],
      notes: [],
      referrals: [],
      childIsAtRisk: false,
      summary: '',
      status: 'open',
      caseCounselor: '',
      currentCounselor: '',
      createdAt: '2020-06-29T22:26:00.208Z',
      updatedAt: '',
      followUpDate: '',
      followUpPrintedDate: '',
      categories: {},
      contact: VALID_EMPTY_CONTACT,
      contacts: [VALID_EMPTY_CONTACT],
    };

    ownProps = {
      task: { taskSid: 'task1' } as CustomITask,
      definitionVersion: mockV1,
      can: () => true,
      caseDetails,
      handleClose: jest.fn(),
      handleUpdate: jest.fn(),
      handleSaveAndEnd: jest.fn(),
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
      taskId: 'task1',
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
      taskId: 'task1',
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
      taskId: 'task1',
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
      taskId: 'task1',
      type: 'routing/open-modal',
    });
  });

  test('click View Household button', async () => {
    caseDetails.households = [householdEntry];
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
      taskId: 'task1',
      type: 'routing/open-modal',
    });
  });

  test('click View Perpetrator button', async () => {
    caseDetails.perpetrators = [perpetratorEntry];
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
      taskId: 'task1',
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
      taskId: 'task1',
      type: 'routing/open-modal',
    });
  });

  each([true, false]).test('Click close button on case', async isCreating => {
    const store = mockStore({
      [namespace]: {
        ...initialState[namespace],
        routing: {
          tasks: {
            task1: [
              {
                ...initialState[namespace].routing.tasks.task1[0],
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
