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

import * as React from 'react';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { fetchRules } from '../../../permissions/fetchRules';
import { validateAndSetPermissionRules, getInitializedCan } from '../../../permissions';
import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import CaseList from '../../../components/caseList';
import { getDefinitionVersions } from '../../../hrmConfig';
import { CaseListState } from '../../../states/caseList/reducer';
import { caseListContentInitialState, fetchCaseListAsyncAction } from '../../../states/caseList/listContent';
import { caseListSettingsInitialState } from '../../../states/caseList/settings';
import { Contact, ContactRawJson, standaloneTaskSid } from '../../../types/types';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';
import { HrmState, RootState } from '../../../states';
import { CaseStateEntry } from '../../../states/case/types';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { newGetTimelineAsyncAction } from '../../../states/case/timeline';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();
const e2eRules = require('../../../permissions/e2e.json');

jest.mock('../../../permissions/fetchRules', () => {
  return {
    fetchRules: jest.fn(() => {
      throw new Error('fetchRules not mocked!');
    }),
  };
});

jest.mock('../../../states/case/timeline', () => ({
  newGetTimelineAsyncAction: jest.fn(),
  selectTimelineContactCategories: jest.fn().mockReturnValue({}),
}));

jest.mock('../../../states/caseList/listContent', () => ({
  ...jest.requireActual('../../../states/caseList/listContent'),
  fetchCaseListAsyncAction: jest.fn(),
}));

beforeEach(async () => {
  const fetchRulesSpy = fetchRules as jest.MockedFunction<typeof fetchRules>;
  fetchRulesSpy.mockResolvedValueOnce(e2eRules);
  await validateAndSetPermissionRules();
  getInitializedCan();
});

// console.log = () => null;
console.error = () => null;

const mockedCases: Record<string, CaseStateEntry> = {
  '1': {
    caseWorkingCopy: undefined,
    references: new Set(['x']),
    availableStatusTransitions: [],
    connectedCase: {
      id: '1',
      accountSid: 'AC',
      twilioWorkerId: 'WK worker 1',
      createdAt: '2020-07-07T17:38:42.227Z',
      updatedAt: '2020-07-07T19:20:33.339Z',
      status: 'open',
      info: {
        definitionVersion: DefinitionVersionId.v1,
      },
      helpline: '',
      categories: {},
      firstContact: {
        id: 'contact-1',
      } as Contact,
    },
    timelines: {},
    sections: {},
  },
  '2': {
    caseWorkingCopy: undefined,
    references: new Set(['x']),
    availableStatusTransitions: [],
    connectedCase: {
      id: '2',
      accountSid: 'AC',
      twilioWorkerId: 'WK-worker 2',
      createdAt: '2020-07-07T17:38:42.227Z',
      updatedAt: '2020-07-07T19:20:33.339Z',
      status: 'closed',
      info: {
        definitionVersion: DefinitionVersionId.v1,
      },
      helpline: '',
      firstContact: {
        id: 'contact-2',
        rawJson: {
          childInformation: {
            firstName: 'Sonya',
            lastName: 'Michels',
          },
        } as Partial<ContactRawJson>,
      } as Contact,
      categories: {},
    },
    timelines: {},
    sections: {},
  },
};

const mockedCaseList = Object.keys(mockedCases);
expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const themeConf = {};

function createState(state: RecursivePartial<HrmState>): RootState {
  return {
    [namespace]: state,
  } as RootState;
}

const blankCaseListState: CaseListState = {
  currentSettings: caseListSettingsInitialState(),
  content: caseListContentInitialState(),
};

let mockV1;

const mockFetchCaseListAsyncAction = fetchCaseListAsyncAction as jest.MockedFunction<typeof fetchCaseListAsyncAction>;
const mockNewGetTimelineAsyncAction = newGetTimelineAsyncAction as jest.MockedFunction<
  typeof newGetTimelineAsyncAction
>;

beforeEach(() => {
  mockReset();
  mockFetchCaseListAsyncAction.mockReset();
  mockFetchCaseListAsyncAction.mockReturnValue({ type: 'cases/fetch-list' } as any);
  mockNewGetTimelineAsyncAction.mockReset();
  mockNewGetTimelineAsyncAction.mockReturnValue({ type: 'case-action/get-timeline' } as any);
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

test('Should dispatch fetchList actions', async () => {
  const initialState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    caseList: blankCaseListState,
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  await waitFor(() => screen.getByTestId('CaseList-Table'));

  expect(screen.getByTestId('CaseList-Table')).toBeInTheDocument();

  expect(screen.getAllByTestId('CaseList-TableHead')).toHaveLength(1);
  expect(screen.queryByTestId('CaseList-TableFooter')).not.toBeInTheDocument();

  expect(store.getActions().length).toBe(1);

  expect(store.getActions()[0]).toMatchObject({
    type: 'cases/fetch-list',
  });
});

test('Should render list if it is populated', async () => {
  const initialState: RootState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    connectedCase: {
      cases: mockedCases,
    },
    caseList: {
      ...blankCaseListState,
      content: {
        ...blankCaseListState.content,
        caseList: mockedCaseList,
        caseCount: mockedCaseList.length,
        listLoading: false,
      },
    },
    activeContacts: {
      existingContacts: {
        'contact-1': {
          savedContact: {
            ...VALID_EMPTY_CONTACT,
            id: 'contact-1',
            caseId: '1',
            rawJson: {
              ...VALID_EMPTY_CONTACT.rawJson,
              childInformation: {
                ...VALID_EMPTY_CONTACT.rawJson.childInformation,
                firstName: 'Michael',
                lastName: 'Smith',
              },
            },
          },
        },
        'contact-2': {
          savedContact: {
            ...VALID_EMPTY_CONTACT,
            id: 'contact-2',
            caseId: '2',
            rawJson: {
              ...VALID_EMPTY_CONTACT.rawJson,
              childInformation: {
                ...VALID_EMPTY_CONTACT.rawJson.childInformation,
                firstName: 'Sonya',
                lastName: 'Michels',
              },
            },
          },
        },
      },
    },
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  await waitFor(() => screen.getByTestId('CaseList-Table'));

  expect(screen.getByTestId('CaseList-Table')).toBeInTheDocument();

  expect(screen.getAllByTestId('CaseList-TableHead')).toHaveLength(1);

  expect(screen.getAllByTestId('CaseList-TableFooter')).toHaveLength(1);

  const rows = screen.getAllByTestId('CaseList-TableRow');
  expect(rows).toHaveLength(2);

  const [row1, row2] = rows;
  expect(row1.textContent).toContain('Michael Smith');
  expect(row2.textContent).toContain('Sonya Michels');
});

test('Should render no cases and show No Cases Found row', async () => {
  const initialState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    caseList: {
      ...blankCaseListState,
      content: {
        ...blankCaseListState.content,
        caseList: [],
        caseCount: 0,
        listLoading: false,
      },
    },
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  await waitFor(() => screen.getByTestId('CaseList-Table'));

  expect(screen.getByTestId('CaseList-Table')).toBeInTheDocument();

  expect(screen.getAllByTestId('CaseList-TableHead')).toHaveLength(1);

  expect(screen.queryByTestId('CaseList-TableFooter')).not.toBeInTheDocument();

  expect(screen.queryByTestId('CaseList-TableRow')).not.toBeInTheDocument();
});

test('Should render error page if fetchError set in store', async () => {
  const initialState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    caseList: {
      ...blankCaseListState,
      content: { ...blankCaseListState.content, fetchError: new Error('Some error') as any },
    },
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  await waitFor(() => screen.getByTestId('CaseList-SomethingWentWrongText'));

  expect(screen.queryByTestId('CaseList-Table')).toBeNull();

  expect(screen.getByTestId('CaseList-SomethingWentWrongText')).toBeInTheDocument();
  expect(screen.getByTestId('CaseList-SomethingWentWrongText').textContent).toBe('CaseList-SomethingWentWrong');
});

test('Should render loading page if listLoading set in store', async () => {
  const initialState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    caseList: {
      ...blankCaseListState,
      content: { ...blankCaseListState.content, listLoading: true },
    },
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  await waitFor(() => screen.getByTestId('CaseList-Table-Loading'));

  expect(screen.queryByTestId('CaseList-Table-Loading')).toBeInTheDocument();
});

test('a11y', async () => {
  const initialState = createState({
    configuration: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    caseList: blankCaseListState,
    routing: {
      tasks: {
        [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
      },
    },
  });
  const store = mockStore(initialState);

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  (expect(results) as any).toHaveNoViolations();
});
