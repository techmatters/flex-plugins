/* eslint-disable no-empty-function */
// @ts-ignore
import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse, mockPartialConfiguration } from '../../mockGetConfig';
import Case from '../../../components/case';
import { namespace, configurationBase, contactFormsBase, connectedCaseBase, routingBase } from '../../../states';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { StandaloneITask } from '../../../types/types';
import { LOAD_CONTACT_ACTION } from '../../../states/contacts/existingContacts';
import { taskFormToSearchContact } from '../../../states/contacts/contactDetailsAdapter';

jest.mock('../../../services/CaseService', () => ({ getActivities: jest.fn(() => []), cancelCase: jest.fn() }));
jest.mock('../../../permissions', () => ({
  getPermissionsForCase: jest.fn(() => ({
    can: () => true,
  })),
  PermissionActions: {},
}));

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

function createState(state) {
  return {
    [namespace]: state,
  };
}

let ownProps;

let mockV1;
let initialState;
describe('useState mocked', () => {
  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
    mockPartialConfiguration({ workerSid: 'current-worker-sid' });
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
            childInformation: {
              firstName: 'first',
              lastName: 'last',
            },
            metadata: {},
            caseInformation: {
              callSummary: 'contact call summary',
            },
            callerInformation: {},
            categories: [],
            taskSid: 'task1',
          },
          temporaryCaseInfo: '',
        },
        existingContacts: {},
      },
      [connectedCaseBase]: {
        tasks: {
          task1: {
            taskSid: 'task1',
            connectedCase: {
              id: 123,
              createdAt: '2020-06-29T22:26:00.208Z',
              updatedAt: '2020-06-29T22:26:00.208Z',
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

    ownProps = {
      task: initialState[namespace][connectedCaseBase].tasks.task1 as StandaloneITask,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Case (should return null)', async () => {
    initialState = createState({
      [contactFormsBase]: {
        existingContacts: {},
        tasks: {
          task1: {
            childInformation: {
              name: { firstName: 'first', lastName: 'last' },
            },
            metadata: {},
            taskSid: 'task1',
          },
        },
      },
      [connectedCaseBase]: {
        tasks: {},
      },
      [routingBase]: { tasks: { task1: { route: 'new-case' } } },
      [configurationBase]: {
        counselors: {
          list: [],
          hash: { worker1: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
    });
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
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('123');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').value).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').value).toBe('—');

    expect(store.dispatch).toHaveBeenCalledWith({
      contacts: [
        taskFormToSearchContact(
          initialState[namespace][connectedCaseBase].tasks.task1,
          initialState[namespace][contactFormsBase].tasks.task1,
          expect.anything(),
          'current-worker-sid',
          '__unsavedFromCase:123',
        ),
      ],
      reference: 'task1',
      replaceExisting: false,
      type: LOAD_CONTACT_ACTION,
    });
  });

  test('Contact name should render once contact is saved to redux', async () => {
    const stateWithContact = createState({
      ...initialState[namespace],
      [contactFormsBase]: {
        ...initialState[namespace][contactFormsBase],
        existingContacts: {
          '__unsavedFromCase:123': {
            savedContact: taskFormToSearchContact(
              initialState[namespace][connectedCaseBase].tasks.task1,
              initialState[namespace][contactFormsBase].tasks.task1,
              expect.anything(),
              'current-worker-sid',
              '__unsavedFromCase:123',
            ),
            references: ['task1'],
          },
        },
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

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('123');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').value).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').value).toBe('—');
    expect(screen.getByTestId('Case-DetailsHeaderChildName').innerHTML).toContain('first last');
  });

  test('Case (should render, after update)', async () => {
    initialState[namespace][connectedCaseBase].tasks.task1.connectedCase.updatedAt = '2020-06-29T22:29:00.208Z';
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('123');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(screen.getByTestId('Case-Details_DateOpened').value).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').value).toBe('6/29/2020');

    expect(store.dispatch).toHaveBeenCalledWith({
      contacts: [
        taskFormToSearchContact(
          initialState[namespace][connectedCaseBase].tasks.task1,
          initialState[namespace][contactFormsBase].tasks.task1,
          expect.anything(),
          'current-worker-sid',
          '__unsavedFromCase:123',
        ),
      ],
      reference: 'task1',
      replaceExisting: false,
      type: LOAD_CONTACT_ACTION,
    });
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
