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

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import Case from '../../../components/case';
import { namespace, configurationBase, contactFormsBase, connectedCaseBase, routingBase } from '../../../states';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { StandaloneITask } from '../../../types/types';

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
        tasks: {
          task1: {
            childInformation: {
              name: { firstName: 'first', lastName: 'last' },
            },
            metadata: {},
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

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('123');
    expect(screen.getByTestId('Case-DetailsHeaderChildName').innerHTML).toContain('first last');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(
      within(screen.getByTestId('Case-Details_CaseStatus')).getByRole('option', { name: 'Open' }).selected,
    ).toBeTruthy();
    expect(screen.getByTestId('Case-Details_DateOpened').value).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').value).toBe('—');
  });

  test('Case (should render, after update)', async () => {
    const initial = initialState;
    initial[namespace][connectedCaseBase].tasks.task1.connectedCase.updatedAt = '2020-06-29T22:29:00.208Z';
    const store = mockStore(initial);

    render(
      <StorelessThemeProvider themeConf={{}}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getByTestId('CaseHome-CaseDetailsComponent')).toBeInTheDocument();

    expect(screen.getByTestId('Case-DetailsHeaderCaseId').innerHTML).toContain('123');
    expect(screen.getByTestId('Case-DetailsHeaderChildName').innerHTML).toContain('first last');
    expect(screen.getByTestId('Case-DetailsHeaderCounselor').innerHTML).toContain('worker1 name');
    expect(
      within(screen.getByTestId('Case-Details_CaseStatus')).getByRole('option', { name: 'Open' }).selected,
    ).toBeTruthy();
    expect(screen.getByTestId('Case-Details_DateOpened').value).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').value).toBe('6/29/2020');
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
