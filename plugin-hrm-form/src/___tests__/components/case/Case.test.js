/* eslint-disable no-empty-function */
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { render, screen, fireEvent } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import '../../mockGetConfig';
import HrmTheme from '../../../styles/HrmTheme';
import Case from '../../../components/case';
import CaseDetails from '../../../components/case/CaseDetails';
import { namespace, configurationBase, contactFormsBase, connectedCaseBase, routingBase } from '../../../states';
import { UPDATE_TEMP_INFO } from '../../../states/case/types';
import { cancelCase, getActivities } from '../../../services/CaseService';
import mockV1 from '../../../formDefinitions/v1';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('../../../services/CaseService', () => ({ getActivities: jest.fn(() => []), cancelCase: jest.fn() }));

/**
 * Fix issue with Popper.js:
 * https://stackoverflow.com/questions/60333156/how-to-fix-typeerror-document-createrange-is-not-a-function-error-while-testi
 */
global.document.createRange = () => ({
  setStart: () => null,
  setEnd: () => null,
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const entry = {
  name: {
    firstName: 'first',
    lastName: 'last',
  },
  location: {
    streetAddress: 'street',
    city: 'city',
    stateOrCounty: 'state',
    postalCode: 'code',
    phone1: 'phone1',
    phone2: 'phone2',
  },
  age: 'age',
  ethnicity: 'ethnicity',
  gender: 'gender',
  language: 'language',
  nationality: 'nationality',
  relationshipToChild: 'relationshipToChild',
};

const perpetratorEntry = { perpetrator: entry, createdAt: '2020-06-29T22:26:00.208Z', twilioWorkerId: 'worker1' };
const householdEntry = { household: entry, createdAt: '2020-06-29T22:26:00.208Z', twilioWorkerId: 'worker1' };

function createState(state) {
  return {
    [namespace]: state,
  };
}

const themeConf = {
  colorTheme: HrmTheme,
};

const ownProps = {
  task: {
    taskSid: 'task1',
    attributes: {
      isContactlessTask: false,
    },
  },
};

describe('useState mocked', () => {
  const setState = jest.fn();
  const useStateMock = initState => [initState, setState];

  jest.spyOn(React, 'useState').mockImplementation(useStateMock);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Case (should return null)', async () => {
    const initialState = createState({
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

    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    ).root;

    const details = component.findAllByType(CaseDetails);
    expect(details.length).toBe(0);
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
          connectedCase: {
            id: 123,
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: { definitionVersion: 'v1' },
            connectedContacts: [],
          },
          temporaryCaseInfo: '',
        },
      },
    },
    [routingBase]: { tasks: { task1: { route: 'new-case' } } },
  });

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

  test('Case (should render)', async () => {
    const store = mockStore(initialState);

    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    ).root;

    expect(component.findAllByType(CaseDetails).length).toBe(1);
    const details = component.findByType(CaseDetails);
    const { caseId, name, counselor, status, openedDate, lastUpdatedDate, followUpDate } = details.props;

    expect(caseId).toBe(123);
    expect(name).toBe('first last');
    expect(counselor).toBe('worker1 name');
    expect(status).toBe('open');
    expect(openedDate).toBe('6/29/2020'); // the day the createdAt number represents
    expect(lastUpdatedDate).toBe('Invalid Date');
    expect(followUpDate).toBe('');
  });

  function openCancelMenu(wrapper) {
    wrapper
      .find('button')
      .find('t')
      .findWhere(t => t.prop('code') === 'BottomBar-Cancel')
      .simulate('click');
  }

  function clickCancelCase(wrapper) {
    wrapper
      .find('MenuItem')
      .find('t')
      .findWhere(t => t.prop('code') === 'BottomBar-CancelNewCaseAndClose')
      .simulate('click');
  }

  /*
   * Commenting this test out since we need to deploy View Case functionality to staging
   * This will be revisited and fixed when we'll working on New Case revamp.
   *
   *test('click cancel button', () => {
   *  const ownProps = {
   *    task: {
   *      taskSid: 'task1',
   *    },
   *  };
   *
   *  const store = mockStore(initialState);
   *
   *  const wrapper = mount(
   *    <StorelessThemeProvider themeConf={themeConf}>
   *      <Provider store={store}>
   *        <Case {...ownProps} />
   *      </Provider>
   *    </StorelessThemeProvider>,
   *  );
   *
   *  openCancelMenu(wrapper);
   *  clickCancelCase(wrapper);
   *
   *  expect(cancelCase).toHaveBeenCalled();
   *});
   */

  test('click Add Note button', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
    const stateWithHousehold = addInfoToCase({ households: [householdEntry] });
    const store = mockStore(stateWithHousehold);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('Case-InformationRow-ViewButton').click();

    expect(store.dispatch).toHaveBeenCalledWith({
      value: { screen: 'view-household', info: householdEntry },
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
    const stateWithPerpetrators = addInfoToCase({ perpetrators: [perpetratorEntry] });
    const store = mockStore(stateWithPerpetrators);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    screen.getByTestId('Case-InformationRow-ViewButton').click();

    expect(store.dispatch).toHaveBeenCalledWith({
      value: { screen: 'view-perpetrator', info: perpetratorEntry },
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

  test('edit case summary', async () => {
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const checkbox = screen.getByTestId('Case-ChildIsAtRisk-Checkbox');
    fireEvent.click(checkbox);

    const updateCaseCall = store.dispatch.mock.calls[0][0];
    expect(updateCaseCall.type).toBe('UPDATE_CASE_INFO');
    expect(updateCaseCall.taskId).toBe(ownProps.task.taskSid);
    expect(updateCaseCall.info.childIsAtRisk).toBe(true);
  });

  test('a11y', async () => {
    getActivities.mockReturnValueOnce(Promise.resolve([]));
    const store = mockStore(initialState);

    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
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
});
