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
import { namespace, configurationBase, caseListBase } from '../../../states';
import { listCases } from '../../../services/CaseService';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { CaseListState } from '../../../states/caseList/reducer';

// console.log = () => null;
console.error = () => null;

const mockedCaseList = [
  {
    id: '1',
    twilioWorkerId: 'worker 1',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'open',
    info: { definitionVersion: 'v1' },
    childName: 'Michael Smith',
    callSummary: 'Summary',
    categories: { category1: ['cat1'] },
  },
  {
    id: '2',
    twilioWorkerId: 'worker 2',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'closed',
    info: { definitionVersion: 'v1' },
    childName: 'Sonya Michels',
    callSummary: 'Summary',
    categories: { category1: ['cat2'] },
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
  currentSettings: {
    filter: {
      counsellors: [],
      statuses: [],
      includeOrphans: false,
    },
    sort: {},
    page: 0,
  },
};

let mockV1;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

test('Should render', async () => {
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

  const rows = screen.getAllByTestId('CaseList-TableRow');
  expect(rows).toHaveLength(2);

  const [row1, row2] = rows;
  expect(row1.textContent).toContain('Michael Smith');
  expect(row2.textContent).toContain('Sonya Michels');
});

test('Should not render (error)', async () => {
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

  await waitFor(() => screen.getByTestId('CaseList-SomethingWentWrongText'));

  expect(screen.queryByTestId('CaseList-Table')).toBeNull();

  expect(screen.getByTestId('CaseList-SomethingWentWrongText')).toBeInTheDocument();
  expect(screen.getByTestId('CaseList-SomethingWentWrongText').textContent).toBe('CaseList-SomethingWentWrong');
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
