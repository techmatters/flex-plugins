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
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse, mockPartialConfiguration } from '../../mockGetConfig';
import Case from '../../../components/case';
import { HrmState, RootState } from '../../../states';
import { getDefinitionVersions } from '../../../hrmConfig';
import { Contact, StandaloneITask, standaloneTaskSid } from '../../../types/types';
import { LOAD_CONTACT_ACTION } from '../../../states/contacts/existingContacts';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { RecursivePartial } from '../../RecursivePartial';
import { namespace } from '../../../states/storeNamespaces';

jest.mock('../../../services/CaseService', () => ({ getActivities: jest.fn(() => []), cancelCase: jest.fn() }));
jest.mock('../../../permissions', () => ({
  getPermissionsForCase: jest.fn(() => ({
    can: () => true,
  })),
  getPermissionsForContact: jest.fn(() => ({
    can: () => true,
  })),
  PermissionActions: {},
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

function createState(state: RecursivePartial<HrmState>): RootState {
  return {
    [namespace]: state,
  } as RootState;
}

let ownProps;

let mockV1;
let initialState: RootState;

beforeEach(() => {
  mockReset();
});

describe('useState mocked', () => {
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
    mockPartialConfiguration({ workerSid: 'current-worker-sid' });
  });

  const connectedContact: Contact = {
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
      callerInformation: {},
      categories: {},
    },
    taskId: 'task1',
  };

  beforeEach(() => {
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
        existingContacts: {},
      },
      connectedCase: {
        cases: {
          case1: {
            connectedCase: {
              id: '123',
              createdAt: '2020-06-29T22:26:00.208Z',
              updatedAt: '2020-06-29T22:26:00.208Z',
              twilioWorkerId: 'worker1',
              status: 'open',
              info: { definitionVersion: DefinitionVersionId.v1 },
              connectedContacts: [connectedContact],
            },
          },
        },
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
    initialState = createState({
      activeContacts: {
        existingContacts: {
          contact1: {
            savedContact: {
              ...VALID_EMPTY_CONTACT,
              rawJson: {
                ...VALID_EMPTY_CONTACT.rawJson,
                childInformation: {
                  firstName: 'first',
                  lastName: 'last',
                },
              },
              taskId: 'task1',
            },
            metadata: {},
          },
        },
      },
      connectedCase: {
        cases: {},
      },
      routing: { tasks: { [standaloneTaskSid]: [{ route: 'case', subroute: 'home', caseId: 'case1' }] } },
      configuration: {
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
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe('—');

    expect(store.dispatch).toHaveBeenCalledWith({
      contacts: [connectedContact],
      reference: 'case-123',
      replaceExisting: false,
      type: LOAD_CONTACT_ACTION,
    });
  });

  test('Contact name should render once contact is saved to redux', async () => {
    const stateWithContact = createState({
      ...initialState[namespace],
      activeContacts: {
        ...initialState[namespace].activeContacts,
        existingContacts: {
          contact1: {
            savedContact: connectedContact,

            references: ['case-123'],
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
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe('—');
    expect(screen.getByTestId('NavigableContainer-Title').innerHTML).toContain('first last');
  });

  test('Case (should render, after update)', async () => {
    initialState[namespace].connectedCase.cases.case1.connectedCase.updatedAt = '2020-06-29T22:29:00.208Z';
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
    expect(screen.getByTestId('Case-Details_DateOpened').getAttribute('value')).toBe('6/29/2020');
    expect(screen.getByTestId('Case-Details_DateLastUpdated').getAttribute('value')).toBe('6/29/2020');

    expect(store.dispatch).toHaveBeenCalledWith({
      contacts: [connectedContact],
      reference: 'case-123',
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
