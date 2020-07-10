import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import HrmTheme from '../../../styles/HrmTheme';
import CaseList from '../../../components/caseList';
import CaseListTable from '../../../components/caseList/CaseListTable';
import CaseListTableHead from '../../../components/caseList/CaseListTableHead';
import CaseListTableRow from '../../../components/caseList/CaseListTableRow';
import CaseListTableFooter from '../../../components/caseList/CaseListTableFooter';
import { namespace, configurationBase } from '../../../states';

const mockedCaseList = [
  {
    id: '1',
    twilioWorkerId: 'worker 1',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'open',
    info: '',
    childName: 'Michael Smith',
    callSummary: 'Summary',
    categories: ['cat1'],
  },
  {
    id: '2',
    twilioWorkerId: 'worker 2',
    createdAt: '2020-07-07T17:38:42.227Z',
    updatedAt: '2020-07-07T19:20:33.339Z',
    status: 'closed',
    info: '',
    childName: 'Sonya Michels',
    callSummary: 'Summary',
    categories: ['cat2'],
  },
];

jest.mock('../../../services/CaseService', () => ({
  getCases: () => Promise.resolve(mockedCaseList),
}));

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const themeConf = {
  colorTheme: HrmTheme,
};

function createState(state) {
  return {
    [namespace]: state,
  };
}

test('Should render', async () => {
  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
    },
  });
  const store = mockStore(initialState);

  const component = renderer.create(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <CaseList />
      </Provider>
    </StorelessThemeProvider>,
  ).root;

  expect(() => component.findByType(CaseList).findByType(CaseListTable)).toThrow();

  await Promise.resolve();

  expect(() => component.findByType(CaseList).findByType(CaseListTable)).not.toThrow();

  const table = component.findByType(CaseList).findByType(CaseListTable);

  expect(table.findAllByType(CaseListTableHead)).toHaveLength(1);
  // const head = table.findByType(CaseListTableHead);

  expect(table.findAllByType(CaseListTableFooter)).toHaveLength(1);
  // const footer = table.findByType(CaseListTableHead);

  const rows = table.findAllByType(CaseListTableRow);
  expect(rows).toHaveLength(2);
  const [row1, row2] = rows;
  expect(row1.props.caseItem).toStrictEqual(mockedCaseList[0]);
  expect(row2.props.caseItem).toStrictEqual(mockedCaseList[1]);
});

test('a11y', async () => {
  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
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

  await Promise.resolve();

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
