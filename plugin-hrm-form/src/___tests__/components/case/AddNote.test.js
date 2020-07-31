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
import AddNote from '../../../components/case/AddNote';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../../states';
import { Actions } from '../../../states/ContactState';
import * as CaseActions from '../../../states/case/actions';
import { UPDATE_CASE_INFO } from '../../../states/case/types';

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

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
          temporaryCaseInfo: 'Mocked temp value',
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
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <AddNote {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(onClickClose).not.toHaveBeenCalled();

  expect(screen.getByTestId('Case-AddNoteScreen-CloseCross')).toBeInTheDocument();
  screen.getByTestId('Case-AddNoteScreen-CloseCross').click();

  expect(onClickClose).toHaveBeenCalled();

  onClickClose.mockClear();

  expect(onClickClose).not.toHaveBeenCalled();

  expect(screen.getByTestId('Case-AddNoteScreen-CloseButton')).toBeInTheDocument();
  screen.getByTestId('Case-AddNoteScreen-CloseButton').click();

  expect(onClickClose).toHaveBeenCalled();
});

test('Test input/add note functionality', async () => {
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    onClickClose,
    task: {
      taskSid: 'task1',
    },
  };

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <AddNote {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(store.dispatch).not.toHaveBeenCalled();

  const textarea = screen.getByTestId('Case-AddNoteScreen-TextArea');
  fireEvent.change(textarea, { target: { value: 'Some note' } });

  expect(store.dispatch).toHaveBeenCalledWith(CaseActions.updateTempInfo('Some note', ownProps.task.taskSid));

  store.dispatch.mockClear();
  expect(store.dispatch).not.toHaveBeenCalled();

  screen.getByTestId('Case-AddNoteScreen-SaveNote').click();

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  const updateCaseCall = store.dispatch.mock.calls[0][0];
  expect(updateCaseCall.type).toBe(UPDATE_CASE_INFO);
  expect(updateCaseCall.taskId).toBe(ownProps.task.taskSid);
  expect(updateCaseCall.info.notes[0].note).toBe('Mocked temp value');

  expect(store.dispatch).toHaveBeenCalledWith(Actions.changeRoute('new-case', ownProps.task.taskSid));
  store.dispatch.mockClear();
});

test('a11y', async () => {
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    onClickClose,
    task: {
      taskSid: 'task1',
    },
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <AddNote {...ownProps} />
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
