import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../../mockGetConfig';
import HrmTheme from '../../../styles/HrmTheme';
import AddReferral from '../../../components/case/AddReferral';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import * as RoutingActions from '../../../states/routing/actions';
import * as CaseActions from '../../../states/case/actions';
import { updateCase } from '../../../services/CaseService';
import mockV1 from '../../../formDefinitions/v1';

jest.mock('../../../services/CaseService');

const flushPromises = () => new Promise(setImmediate);

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

const reduxReferral = {
  date: new Date(),
  referredTo: 'OSC',
  comments: 'Some Comment',
};

const state = {
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
          temporaryCaseInfo: {
            screen: 'add-referral',
            info: reduxReferral,
          },
          connectedCase: {
            createdAt: 1593469560208,
            twilioWorkerId: 'worker1',
            status: 'open',
            info: null,
          },
        },
      },
    },
    routing: {
      route: 'new-case',
      tasks: {
        task1: {
          route: 'new-case',
        },
      },
    },
  },
};

const store = mockStore(state);
store.dispatch = jest.fn();

const themeConf = {
  colorTheme: HrmTheme,
};

test('Test close functionality', async () => {
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    onClickClose,
    task: {
      taskSid: 'task1',
    },
    formsVersion: mockV1,
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <AddReferral {...ownProps} />
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

test('a11y', async () => {
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    onClickClose,
    task: {
      taskSid: 'task1',
    },
    formsVersion: mockV1,
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <AddReferral {...ownProps} />
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
