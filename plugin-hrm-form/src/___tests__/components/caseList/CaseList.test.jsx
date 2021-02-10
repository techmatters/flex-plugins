import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import '../../mockGetConfig';
import HrmTheme from '../../../styles/HrmTheme';
import CaseList from '../../../components/caseList';
import { namespace, configurationBase } from '../../../states';
import { getCases } from '../../../services/CaseService';

// console.log = () => null;
console.error = () => null;

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
    categories: { category1: ['cat1'] },
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
    categories: { category1: ['cat2'] },
  },
];

jest.mock('../../../services/CaseService', () => ({ getCases: jest.fn() }));

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
  // @ts-ignore
  getCases.mockReturnValueOnce(Promise.resolve({ cases: mockedCaseList, count: mockedCaseList.length }));

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
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

  expect(screen.queryByTestId('CaseList-Table')).toBeNull();

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
  getCases.mockImplementationOnce(async () => {
    throw new Error('Some error');
  });

  const initialState = createState({
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
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

  expect(screen.queryByTestId('CaseList-Table')).toBeNull();

  await waitFor(() => screen.getByTestId('CaseList-SomethingWentWrongText'));

  expect(screen.queryByTestId('CaseList-Table')).toBeNull();

  expect(screen.getByTestId('CaseList-SomethingWentWrongText')).toBeInTheDocument();
  expect(screen.getByTestId('CaseList-SomethingWentWrongText').textContent).toBe('CaseList-SomethingWentWrong');
});

test('a11y', async () => {
  // @ts-ignore
  getCases.mockReturnValueOnce(Promise.resolve({ cases: mockedCaseList, count: mockedCaseList.length }));

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

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
