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
import renderer from 'react-test-renderer';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Template } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '../mockStyled';
import '../mockGetConfig';
import { callTypes } from '@tech-matters/hrm-form-definitions';

import '../../states/conferencing';
import {
  DataCallTypeButton,
  NonDataCallTypeButton,
  ConfirmButton,
  CancelButton,
} from '../../components/callTypeButtons/styles';
import LocalizationContext from '../../contexts/LocalizationContext';
import { changeRoute } from '../../states/routing/actions';
import { updateDraft } from '../../states/contacts/existingContacts';
import { completeTask } from '../../services/formSubmissionHelpers';
import CallTypeButtons from '../../components/callTypeButtons';
import { submitContactFormAsyncAction, updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace } from '../../states/storeNamespaces';
import { VALID_EMPTY_METADATA } from '../testContacts';

jest.mock('../../states/conferencing', () => ({}));

jest.mock('../../states/contacts/saveContact', () => ({
  updateContactInHrmAsyncAction: jest.fn(),
  saveContactReducer: jest.fn(state => state),
  loadContactFromHrmByTaskSidAsyncAction: jest.fn(),
  submitContactFormAsyncAction: jest.fn(),
  createContactAsyncAction: jest.fn(),
}));

jest.mock('../../services/formSubmissionHelpers', () => ({
  completeTask: jest.fn(),
}));

const mockStore = configureMockStore([]);

const task = {
  sid: 'reservation-task-sid',
  taskSid: 'task-sid',
  attributes: {},
};

const strings = {
  TaskHeaderEndCall: 'HANG UP',
  TaskHeaderEndChat: 'END CHAT',
};

const withEndCall = <Template code="TaskHeaderEndCall" />;
const withEndChat = <Template code="TaskHeaderEndChat" />;

afterEach(() => {
  jest.clearAllMocks();
});

const currentDefinitionVersion = {
  callTypeButtons: [
    {
      name: 'child',
      label: 'Child calling about self',
      type: 'button',
      category: 'data',
    },
    {
      name: 'caller',
      label: 'Someone calling about a child',
      type: 'button',
      category: 'data',
    },
    {
      name: 'silent',
      label: 'Silent',
      type: 'button',
      category: 'non-data',
    },
    {
      name: 'blank',
      label: 'Blank',
      type: 'button',
      category: 'non-data',
    },
    {
      name: 'joke',
      label: 'Joke',
      type: 'button',
      category: 'non-data',
    },
    {
      name: 'hangup',
      label: 'Hang up',
      type: 'button',
      category: 'non-data',
    },
    {
      name: 'wrongnumber',
      label: 'Wrong Number',
      type: 'button',
      category: 'non-data',
    },
    {
      name: 'abusive',
      label: 'Abusive',
      type: 'button',
      category: 'non-data',
    },
  ],
};

test('<CallTypeButtons> inital render (no dialog)', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: '',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  expect(() => component.findAllByType(DataCallTypeButton)).not.toThrow();
  expect(() => component.findAllByType(NonDataCallTypeButton)).not.toThrow();
});

const getConfirmButtonText = component => component.findByType(ConfirmButton).props.children;

test('<CallTypeButtons> renders dialog with all buttons', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'child',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  const callTypeButtonsDefinitions =
    initialState[namespace][configurationBase].currentDefinitionVersion.callTypeButtons;

  const dataCallTypeButtonsRendered = component.findAllByType(DataCallTypeButton);
  const nonDataCallTypeButtonsRendered = component.findAllByType(NonDataCallTypeButton);

  expect(dataCallTypeButtonsRendered.length).toBe(callTypeButtonsDefinitions.filter(x => x.category === 'data').length);
  expect(nonDataCallTypeButtonsRendered.length).toBe(
    callTypeButtonsDefinitions.filter(x => x.category === 'non-data').length,
  );
});

test('<CallTypeButtons> renders dialog with END CHAT button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'child',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => false;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndChat.props);
  expect(confirmButtonText.type).toStrictEqual(withEndChat.type);
});

test('<CallTypeButtons> renders dialog with HANG UP button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'child',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);

  const isCallTask = () => true;

  const component = renderer.create(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} dispatch={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  ).root;

  const confirmButtonText = getConfirmButtonText(component);

  expect(confirmButtonText.props).toStrictEqual(withEndCall.props);
  expect(confirmButtonText.type).toStrictEqual(withEndCall.type);
});

test('<CallTypeButtons> click on Data (Child) button', async () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'child',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('Child calling about self')).toBeInTheDocument();
  screen.getByText('Child calling about self').click();
  await waitFor(() => {
    expect(store.dispatch).toHaveBeenCalledWith(updateDraft('contact1', { rawJson: { callType: callTypes.child } }));
    expect(store.dispatch).toHaveBeenCalledWith(
      changeRoute({ route: 'tabbed-forms', subroute: 'childInformation', autoFocus: true }, task.taskSid),
    );
  });
});

test('<CallTypeButtons> click on NonData (Joke) button', () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'child',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} handleCompleteTask={jest.fn()} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('Joke')).toBeInTheDocument();
  screen.getByText('Joke').click();

  expect(store.dispatch).toHaveBeenCalledWith(updateDraft('contact1', { rawJson: { callType: 'Joke' } }));
});

test('<CallTypeButtons> click on END CHAT button', async () => {
  const initialState = {
    [namespace]: {
      activeContacts: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              callType: 'blank',
              taskId: task.taskSid,
            },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('TaskHeaderEndChat')).toBeInTheDocument();
  screen.getByText('TaskHeaderEndChat').click();

  await waitFor(() => expect(submitContactFormAsyncAction).toHaveBeenCalled());
  await waitFor(() =>
    expect(completeTask).toHaveBeenCalledWith(task, {
      id: 'contact1',
      callType: 'blank',
      taskId: task.taskSid,
    }),
  );
});

test('<CallTypeButtons> click on CANCEL button', async () => {
  const initialState = {
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          contact1: {
            savedContact: { id: 'contact1', callType: '', taskId: task.taskSid },
            metadata: VALID_EMPTY_METADATA,
          },
        },
      },
      [configurationBase]: {
        currentDefinitionVersion,
      },
      [connectedCaseBase]: { tasks: {} },
    },
  };
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  const isCallTask = () => false;

  render(
    <LocalizationContext.Provider value={{ strings, isCallTask }}>
      <Provider store={store}>
        <CallTypeButtons task={task} />
      </Provider>
    </LocalizationContext.Provider>,
  );

  expect(screen.getByText('CancelButton')).toBeInTheDocument();
  screen.getByText('CancelButton').click();

  await waitFor(() => expect(completeTask).not.toHaveBeenCalled());
  await waitFor(() => expect(updateContactInHrmAsyncAction).not.toHaveBeenCalled());
});
