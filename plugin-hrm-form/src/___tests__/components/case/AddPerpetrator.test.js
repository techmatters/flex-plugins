import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import * as RoutingActions from '../../../states/routing/actions';
import * as CaseActions from '../../../states/case/actions';
import { UPDATE_TEMP_INFO, UPDATE_CASE_INFO } from '../../../states/case/types';
import AddPerpetrator, { newFormEntry } from '../../../components/case/AddPerpetrator';
import HrmTheme from '../../../styles/HrmTheme';
import { getFormValues } from '../../../components/common/forms/helpers';

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
          temporaryCaseInfo: '',
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
          temporaryCaseInfo: newFormEntry,
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
        <Provider store={store1}>
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

    expect(store2.dispatch).toHaveBeenCalledWith(CaseActions.updateTempInfo(newFormEntry, task.taskSid));
    // clear the call made by useEffect
    store2.dispatch.mockClear();
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
      expect(store2.dispatch.mock.calls[0][0].value).not.toStrictEqual(newFormEntry);
    });
  });

  test('Handle onSave', async () => {
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

    expect(store2.dispatch).toHaveBeenCalledTimes(2);
    const setConnectedCaseCall1 = store2.dispatch.mock.calls[0][0];
    expect(setConnectedCaseCall1.type).toBe(UPDATE_CASE_INFO);
    expect(setConnectedCaseCall1.taskId).toBe(ownProps.task.taskSid);
    expect(setConnectedCaseCall1.info.perpetrators[0].perpetrator).toStrictEqual(
      getFormValues(state2[namespace][connectedCaseBase].tasks.task1.temporaryCaseInfo),
    );

    expect(store2.dispatch).toHaveBeenCalledWith(
      RoutingActions.changeRoute({ route: 'new-case' }, ownProps.task.taskSid),
    );

    // Save and stay
    store2.dispatch.mockClear();
    screen.getByTestId('Case-AddPerpetratorScreen-SaveAndAddAnotherPerpetrator').click();

    expect(store2.dispatch).toHaveBeenCalledTimes(2);
    const setConnectedCaseCall2 = store2.dispatch.mock.calls[0][0];
    expect(setConnectedCaseCall2.type).toBe(UPDATE_CASE_INFO);
    expect(setConnectedCaseCall2.taskId).toBe(ownProps.task.taskSid);
    expect(setConnectedCaseCall2.info.perpetrators[0].perpetrator).toStrictEqual(
      getFormValues(state2[namespace][connectedCaseBase].tasks.task1.temporaryCaseInfo),
    );

    // component calls useEffect and thus calls updateTempInfo
    expect(store2.dispatch).toHaveBeenCalledWith(CaseActions.updateTempInfo(newFormEntry, task.taskSid));
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
