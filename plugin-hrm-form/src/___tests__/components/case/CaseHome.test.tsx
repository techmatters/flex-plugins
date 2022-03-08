// @ts-ignore
import React from 'react';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import { fireEvent, Queries, render, RenderResult, screen } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import CaseHome, { CaseHomeProps } from '../../../components/case/CaseHome';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace, routingBase } from '../../../states';
import { HouseholdEntry, PerpetratorEntry, StandaloneITask } from '../../../types/types';
import { CaseDetails, UPDATE_TEMP_INFO } from '../../../states/case/types';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

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
  perpetrator: entry,
  createdAt: '2020-06-29T22:26:00.208Z',
  twilioWorkerId: 'worker1',
};
const householdEntry: HouseholdEntry = {
  household: entry,
  createdAt: '2020-06-29T22:26:00.208Z',
  twilioWorkerId: 'worker1',
};

function createState(state) {
  return {
    [namespace]: state,
  };
}

let ownProps: CaseHomeProps;

let mockV1;
let initialState;
let caseDetails: CaseDetails;

const addInfoToCase = info => ({
  [namespace]: {
    ...initialState[namespace],
    [connectedCaseBase]: {
      tasks: {
        task1: {
          ...initialState[namespace][connectedCaseBase].tasks.task1,
          connectedCase: {
            ...initialState[namespace][connectedCaseBase].tasks.task1.connectedCase,
            info: { ...info, definitionVersion: 'v1' },
          },
        },
      },
    },
  },
});

describe('useState mocked', () => {
  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    initialState = createState({
      [configurationBase]: {
        counselors: {
          list: [],
          hash: { worker1: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
      [contactFormsBase]: {
        tasks: {
          task1: {
            taskSid: 'task1',
            childInformation: {
              firstName: 'first',
              lastName: 'last',
            },
            metadata: {},
            caseInformation: {
              callSummary: 'contact call summary',
            },
            categories: [],
          },
          temporaryCaseInfo: '',
        },
      },
      [connectedCaseBase]: {
        tasks: {
          task1: {
            taskSid: 'task1',
            connectedCase: {
              id: 123,
              createdAt: '2020-06-29T22:26:00.208Z',
              twilioWorkerId: 'worker1',
              status: 'open',
              info: { definitionVersion: 'v1' },
              connectedContacts: [],
            },
            temporaryCaseInfo: '',
            prevStatus: 'open',
          },
        },
      },
      [routingBase]: { tasks: { task1: { route: 'new-case' } } },
    });

    const setState = jest.fn();
    const useStateMock = initState => [initState, setState];

    jest.spyOn(React, 'useState').mockImplementation(useStateMock);

    caseDetails = {
      id: 0,
      households: [],
      incidents: [],
      perpetrators: [],
      documents: [],
      notes: [],
      referrals: [],
      name: { firstName: '', lastName: '' },
      childIsAtRisk: false,
      summary: '',
      status: 'open',
      prevStatus: 'open',
      caseCounselor: '',
      currentCounselor: '',
      openedDate: '2020-06-29T22:26:00.208Z',
      lastUpdatedDate: '',
      followUpDate: '',
      followUpPrintedDate: '',
      contact: {},
      contacts: [{}],
    };

    ownProps = {
      task: initialState[namespace][connectedCaseBase].tasks.task1 as StandaloneITask,
      definitionVersion: mockV1,
      can: () => true,
      caseDetails,
      timeline: [],
      handleCancelNewCaseAndClose: jest.fn(),
      handleClose: jest.fn(),
      handleUpdate: jest.fn(),
      handleSaveAndEnd: jest.fn(),
      onInfoChange: jest.fn(),
      onStatusChange: jest.fn(),
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
        route: 'new-case',
        subroute: 'add-note',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
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
        route: 'new-case',
        subroute: 'add-referral',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
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
        route: 'new-case',
        subroute: 'add-household',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
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
        route: 'new-case',
        subroute: 'add-perpetrator',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
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

    const { household, ...caseItemEntry } = { ...householdEntry, form: householdEntry.household, id: null };

    expect(store.dispatch).toHaveBeenCalledWith({
      value: {
        screen: 'view-household',
        info: { ...caseItemEntry, index: 0 },
      },
      taskId: 'task1',
      type: UPDATE_TEMP_INFO,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'new-case',
        subroute: 'view-household',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
    });
  });

  test('click View Perpetrator button', async () => {
    caseDetails.perpetrators = [perpetratorEntry];
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    const { perpetrator, ...caseItemEntry } = { ...perpetratorEntry, form: perpetratorEntry.perpetrator, id: null };
    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('Case-InformationRow-ViewButton').click();

    expect(store.dispatch).toHaveBeenCalledWith({
      value: { screen: 'view-perpetrator', info: { ...caseItemEntry, index: 0 } },
      taskId: 'task1',
      type: UPDATE_TEMP_INFO,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      routing: {
        route: 'new-case',
        subroute: 'view-perpetrator',
      },
      taskId: 'task1',
      type: 'CHANGE_ROUTE',
    });
  });

  // CaseSummary still changes case in redux directly rather than delegating to top level component
  test('edit case summary', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const textarea = screen.getByTestId('Case-CaseSummary-TextArea');
    fireEvent.change(textarea, { target: { value: 'Some summary' } });

    const updateCaseCall = store.dispatch.mock.calls[0][0];
    expect(updateCaseCall.type).toBe('UPDATE_CASE_INFO');
    expect(updateCaseCall.taskId).toBe(ownProps.task.taskSid);
    expect(updateCaseCall.info.summary).toBe('Some summary');
  });

  test('click child is at risk checkbox', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const checkbox = screen.getByTestId('Case-ChildIsAtRisk-Checkbox');
    fireEvent.click(checkbox);
    expect(ownProps.onInfoChange).toHaveBeenCalledWith('childIsAtRisk', true);
    /*
     *const updateCaseCall = store.dispatch.mock.calls[0][0];
     *expect(updateCaseCall.type).toBe('UPDATE_CASE_INFO');
     *expect(updateCaseCall.taskId).toBe(ownProps.task.taskSid);
     *expect(updateCaseCall.info.childIsAtRisk).toBe(true);
     */
  });

  test('Click cancel button on new case', async () => {
    const store = mockStore(initialState);
    ownProps.isCreating = true;

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('CaseHome-CancelButton').click();
    // Brittle AF but the HTML the menu component produces makes it difficult to do better.
    (await screen.findAllByRole('menuitem'))[1].click();

    expect(ownProps.handleCancelNewCaseAndClose).toHaveBeenCalled();
    expect(ownProps.handleClose).not.toHaveBeenCalled();
  });

  test('Click close button on existing case', () => {
    const store = mockStore(initialState);
    ownProps.isCreating = false;

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <CaseHome {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );
    screen.getByTestId('CaseHome-CloseButton').click();

    expect(ownProps.handleCancelNewCaseAndClose).not.toHaveBeenCalled();
    expect(ownProps.handleClose).toHaveBeenCalled();
  });
});
