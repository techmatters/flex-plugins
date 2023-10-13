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
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { connectToCase, updateContactsFormInHrm } from '../../../services/ContactService';
import { completeTask, submitContactForm } from '../../../services/formSubmissionHelpers';
import { Case, CustomITask, Contact } from '../../../types/types';
import {
  ExistingContactsState,
  initialState as existingContactInitialState,
} from '../../../states/contacts/existingContacts';
import { ContactMetadata } from '../../../states/contacts/types';
import {
  connectToCaseAsyncAction,
  saveContactReducer,
  submitContactFormAsyncAction,
  updateContactsFormInHrmAsyncAction,
} from '../../../states/contacts/saveContact';

jest.mock('../../../services/ContactService');
jest.mock('../../../services/formSubmissionHelpers');
jest.mock('../../../components/case/Case');

const mockUpdateContactsFormInHrm = updateContactsFormInHrm as jest.Mock<ReturnType<typeof updateContactsFormInHrm>>;
const mockSubmitContactForm = submitContactForm as jest.Mock<ReturnType<typeof submitContactForm>>;
const mockConnectToCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;
const mockCompleteTask = completeTask as jest.Mock<ReturnType<typeof completeTask>>;

beforeEach(() => {
  mockUpdateContactsFormInHrm.mockReset();
  mockSubmitContactForm.mockReset();
  mockConnectToCase.mockReset();
  mockCompleteTask.mockReset();
});

const boundSaveContactReducer = saveContactReducer(existingContactInitialState);

const testStore = (stateChanges: ExistingContactsState) =>
  configureStore({
    preloadedState: { ...existingContactInitialState, ...stateChanges },
    reducer: boundSaveContactReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

const baseContact: Contact = {
  id: '1337',
  accountSid: '',
  timeOfContact: '',
  number: '',
  channel: 'default',
  twilioWorkerId: '',
  helpline: 'test helpline',
  conversationDuration: 0,
  createdBy: '',
  createdAt: '',
  updatedBy: '',
  updatedAt: '',
  queueName: '',
  channelSid: '',
  serviceSid: '',
  taskId: 'TASK_ID',
  conversationMedia: [],
  csamReports: [],
  rawJson: {
    callType: 'Child calling about self',
    caseInformation: {},
    childInformation: { firstName: 'Lorna', lastName: 'Ballantyne' },
    callerInformation: { firstName: 'Charlie', lastName: 'Ballantyne' },
    categories: {},
    contactlessTask: { channel: 'web' },
  },
};

const task = <CustomITask>{ taskSid: 'mock task' };
const metadata = {} as ContactMetadata;

const baseCase: Case = {
  accountSid: 'test-id',
  id: 213,
  helpline: 'za',
  status: 'test-st',
  twilioWorkerId: 'WE2xxx1',
  info: {},
  categories: {},
  createdAt: '12-05-2023',
  updatedAt: '12-05-2023',
  connectedContacts: [baseContact] as Contact[],
};

const baseState: ExistingContactsState = {
  [baseContact.id]: {
    savedContact: baseContact,
    references: new Set('x'),
    categories: {
      gridView: false,
      expanded: {},
    },
  },
} as const;

const dispatch = jest.fn();

describe('actions', () => {
  test('Calls the updateContactsFormInHrmAsyncAction action, and update a contact', async () => {
    const { dispatch, getState } = testStore(baseState);
    const startingState = getState();
    const mockSavedContact = { id: '12' }; // Create a mock savedContact object
    updateContactsFormInHrm.mockResolvedValue(mockSavedContact);

    (await (dispatch(updateContactsFormInHrmAsyncAction(baseContact.id, baseContact.rawJson)) as unknown)) as Promise<
      void
    >;
    const state = getState();

    expect(updateContactsFormInHrm).toHaveBeenCalledWith(baseContact.id, baseContact.rawJson);

    expect(state).toStrictEqual({
      [baseContact.id]: {
        ...startingState[baseContact.id],
      },
      [mockSavedContact.id]: {
        ...state[mockSavedContact.id],
      },
    });
  });

  test('Calls the connectToCaseAsyncAction action, and create a contact, connect contact to case, and complete task', async () => {
    dispatch(connectToCaseAsyncAction(baseContact.id, baseCase.id));

    expect(connectToCase).toHaveBeenCalledWith(baseContact.id, baseCase.id);
  });

  test('Calls the submitContactFormAsyncAction action, and create a contact', async () => {
    submitContactFormAsyncAction(task, baseContact, metadata, baseCase);
    expect(submitContactForm).toHaveBeenCalledWith(task, baseContact, metadata, baseCase);
  });

  test('Nothing currently for that ID - adds the contact with provided reference and blank categories state', () => {
    const newState = boundSaveContactReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      updateContactsFormInHrmAsyncAction(baseContact.id, baseContact.rawJson),
    );
    expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.id].references.size).toStrictEqual(1);
    expect(newState[baseContact.id].references.has('TEST_REFERENCE')).toBeTruthy();
    expect(newState[baseContact.id].categories).toStrictEqual({ gridView: false, expanded: {} });
  });

  test('Same contact currently loaded for that ID with a different reference - leaves contact the same and adds the reference', () => {
    const newState = boundSaveContactReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          references: new Set(['TEST_FIRST_REFERENCE', 'TEST_SECOND_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      updateContactsFormInHrmAsyncAction(baseContact.id, baseContact.rawJson, 'demo-v1'),
    );
    expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.id].references.size).toStrictEqual(2);
    expect([...newState[baseContact.id].references]).toEqual(
      expect.arrayContaining(['TEST_FIRST_REFERENCE', 'TEST_SECOND_REFERENCE']),
    );
  });
});
