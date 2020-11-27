import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../../mockGetConfig';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import * as RoutingActions from '../../../states/routing/actions';
import * as CaseActions from '../../../states/case/actions';
import { UPDATE_TEMP_INFO, UPDATE_CASE_INFO } from '../../../states/case/types';
import AddPerpetrator from '../../../components/case/AddPerpetrator';
import { newCallerFormInformation } from '../../../components/common/forms';
import HrmTheme from '../../../styles/HrmTheme';
import { updateCase } from '../../../services/CaseService';

jest.mock('../../../services/CaseService');

const flushPromises = () => new Promise(setImmediate);

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

const state1 = {
  [namespace]: {
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
    },
    [contactFormsBase]: {
      tasks: {
        task1: {
          childInformation: {
            name: { firstName: { value: 'first' }, lastName: { value: 'last' } },
          },
          metadata: {},
        },
      },
    },
    [connectedCaseBase]: {
      tasks: {
        task1: {
          temporaryCaseInfo: { screen: 'add-perpetrator', info: newCallerFormInformation },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
        },
      },
    },
  },
};
const store1 = mockStore(state1);
store1.dispatch = jest.fn();

const state2 = {
  ...state1,
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: {
      tasks: {
        task1: {
          temporaryCaseInfo: { screen: 'add-perpetrator', info: newCallerFormInformation },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
        },
      },
    },
  },
};
const store2 = mockStore(state2);
store2.dispatch = jest.fn();

const state3 = {
  [namespace]: {
    ...state1[namespace],
    [connectedCaseBase]: {
      tasks: {
        task1: {
          temporaryCaseInfo: null,
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
        },
      },
    },
  },
};
const store3 = mockStore(state3);
store3.dispatch = jest.fn();

const themeConf = {
  colorTheme: HrmTheme,
};

const task = {
  taskSid: 'task1',
};

describe('Test AddPerpetrator', () => {
  test('returns null if temporaryCaseInfo in null or string', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store3}>
          <AddPerpetrator {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.queryByTestId('Case-CloseCross')).toBeNull();
  });

  test('Test close functionality', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddPerpetrator {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(onClickClose).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseCross')).toBeInTheDocument();
    screen.getByTestId('Case-CloseCross').click();

    expect(onClickClose).toHaveBeenCalled();

    onClickClose.mockClear();
    expect(onClickClose).not.toHaveBeenCalled();

    expect(screen.getByTestId('Case-CloseButton')).toBeInTheDocument();
    screen.getByTestId('Case-CloseButton').click();

    expect(onClickClose).toHaveBeenCalled();
  });

  test('Edit input fields', async () => {
    const inputsLabels = [
      'CallerForm-FirstName',
      'CallerForm-LastName',
      'CallerForm-RelationshipToChild',
      'CallerForm-Gender',
      'CallerForm-Age',
      'CallerForm-Language',
      'CallerForm-Nationality',
      'CallerForm-Ethnicity',
      'CallerForm-StreetAddress',
      'CallerForm-City',
      'CallerForm-State/County',
      'CallerForm-PostalCode',
      'CallerForm-Phone#1',
      'CallerForm-Phone#2',
    ];

    const ownProps = {
      counselor: 'Someone',
      onClickClose: jest.fn(),
      task,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddPerpetrator {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    // inputTestIds.forEach(testId => expect(screen.getByTestId(testId)).toBeInTheDocument());
    inputsLabels.forEach(label => expect(screen.getByLabelText(label)).toBeInTheDocument());

    expect(store2.dispatch).not.toHaveBeenCalled();

    const inputs = inputsLabels.map(label => screen.getByLabelText(label));
    expect(inputs).toHaveLength(inputsLabels.length);

    // this are ommited as couldn't achieve making it change (yet)
    const selectInputs = [
      'CallerForm-RelationshipToChild',
      'CallerForm-Gender',
      'CallerForm-Age',
      'CallerForm-Language',
      'CallerForm-Nationality',
      'CallerForm-Ethnicity',
    ];

    inputs.forEach((input, index) => {
      store2.dispatch.mockClear();
      expect(store2.dispatch).not.toHaveBeenCalled();
      if (selectInputs.includes(inputsLabels[index])) return;

      fireEvent.change(input, { target: { value: inputsLabels[index] } });
      expect(store2.dispatch).toHaveBeenCalled();
      expect(store2.dispatch.mock.calls[0][0].type).toBe(UPDATE_TEMP_INFO);
      // check that something changed in the form
      expect(store2.dispatch.mock.calls[0][0].value).not.toStrictEqual(newCallerFormInformation);
    });
  });

  test('Handle onSave and leave', async () => {
    const perpetrator = { firstName: 'Perp', lastName: 'One' };

    const updatedCase = {
      info: { perpetrators: [perpetrator] },
    };

    updateCase.mockReturnValueOnce(Promise.resolve(updatedCase));

    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddPerpetrator {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    // Save and leave
    store2.dispatch.mockClear();
    screen.getByTestId('Case-AddPerpetratorScreen-SavePerpetrator').click();

    await flushPromises();

    expect(store2.dispatch).toHaveBeenCalled();
    expect(updateCase).toHaveBeenCalled();
    const setConnectedCaseCall1 = store2.dispatch.mock.calls[0][0];
    expect(setConnectedCaseCall1.type).toBe('SET_CONNECTED_CASE');
    expect(setConnectedCaseCall1.taskId).toBe(ownProps.task.taskSid);
    expect(setConnectedCaseCall1.connectedCase).toBe(updatedCase);

    expect(onClickClose).toHaveBeenCalled();
  });

  test('Handle onSave and stay', async () => {
    const perpetrator = { firstName: 'Perp', lastName: 'One' };

    const updatedCase = {
      info: { perpetrators: [perpetrator] },
    };

    updateCase.mockReturnValueOnce(Promise.resolve(updatedCase));

    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task,
    };

    render(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddPerpetrator {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    // Save and stay
    store2.dispatch.mockClear();
    screen.getByTestId('Case-AddPerpetratorScreen-SaveAndAddAnotherPerpetrator').click();

    await flushPromises();

    expect(store2.dispatch).toHaveBeenCalled();
    expect(updateCase).toHaveBeenCalled();
    const setConnectedCaseCall2 = store2.dispatch.mock.calls[0][0];
    expect(setConnectedCaseCall2.type).toBe('SET_CONNECTED_CASE');
    expect(setConnectedCaseCall2.taskId).toBe(ownProps.task.taskSid);
    expect(setConnectedCaseCall2.connectedCase).toBe(updatedCase);
  });

  test('a11y', async () => {
    const onClickClose = jest.fn();

    const ownProps = {
      counselor: 'Someone',
      onClickClose,
      task,
    };

    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store2}>
          <AddPerpetrator {...ownProps} />
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
