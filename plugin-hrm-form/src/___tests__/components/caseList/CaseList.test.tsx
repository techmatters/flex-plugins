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
import CaseList from '../../../components/caseList';
import { caseListBase, configurationBase, namespace } from '../../../states';
import { listCases } from '../../../services/CaseService';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { CaseListState } from '../../../states/caseList/reducer';
import {
  caseListContentInitialState,
  fetchCaseListError,
  fetchCaseListStarted,
  fetchCaseListSuccess,
} from '../../../states/caseList/listContent';
import { caseListSettingsInitialState } from '../../../states/caseList/settings';
import { Case } from '../../../types/types';

// console.log = () => null;
console.error = () => null;

const mockedCaseList: (Case & { categories: any; childName: string })[] = [
  {
    id: 1,
    twilioWorkerId: 'worker 1',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'open',
    info: {
      definitionVersion: DefinitionVersionId.v1,
    },
    helpline: '',
    connectedContacts: [],
    categories: {},
    childName: 'Michael Smith',
  },
  {
    id: 2,
    twilioWorkerId: 'worker 2',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'closed',
    info: {
      definitionVersion: DefinitionVersionId.v1,
    },
    helpline: '',
    connectedContacts: [],
    categories: {},
    childName: 'Sonya Michels',
  },
];

jest.mock('../../../services/CaseService', () => ({ listCases: jest.fn() }));

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const themeConf = {};

function createState(state) {
  return {
    [namespace]: state,
  };
}

const blankCaseListState: CaseListState = {
  currentSettings: caseListSettingsInitialState(),
  content: caseListContentInitialState(),
};

let mockV1;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

test('Should dispatch fetchStarted and fetchSuccess actions if case lists return', async () => {
  // @ts-ignore
  listCases.mockReturnValueOnce(Promise.resolve({ cases: mockedCaseList, count: mockedCaseList.length }));

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: blankCaseListState,
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
  expect(store.getActions().length).toBe(2);

  expect(store.getActions()[0]).toStrictEqual(fetchCaseListStarted());
  expect(store.getActions()[1]).toStrictEqual(fetchCaseListSuccess(mockedCaseList, mockedCaseList.length));
});

test('Should render list if it is populated', async () => {
  // @ts-ignore
  listCases.mockReturnValueOnce(Promise.resolve({ cases: mockedCaseList, count: mockedCaseList.length }));

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: {
      ...blankCaseListState,
      content: {
        ...blankCaseListState.content,
        caseList: mockedCaseList,
        caseCount: mockedCaseList.length,
        listLoading: false,
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

test('Should dispatch fetchStarted and fetchError actions if case lists error', async () => {
  // @ts-ignore
  listCases.mockImplementationOnce(async () => {
    throw new Error('Some error');
  });

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: blankCaseListState,
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

  expect(store.getActions()[0]).toStrictEqual(fetchCaseListStarted());
  expect(store.getActions()[1]).toStrictEqual(fetchCaseListError(new Error('Some error')));
});

test('Should render error page if fetchError set in store', async () => {
  // @ts-ignore
  listCases.mockImplementationOnce(async () => {
    throw new Error('Some error');
  });

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: {
      ...blankCaseListState,
      content: { ...blankCaseListState.content, fetchError: new Error('Some error') },
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
  // @ts-ignore
  listCases.mockImplementationOnce(async () => {
    throw new Error('Some error');
  });

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: {
      ...blankCaseListState,
      content: { ...blankCaseListState.content, listLoading: true },
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
  (listCases as jest.Mock).mockReturnValueOnce(
    Promise.resolve({ cases: mockedCaseList, count: mockedCaseList.length }),
  );

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
    },
    [caseListBase]: blankCaseListState,
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
