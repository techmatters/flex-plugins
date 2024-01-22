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

import { connectToCase, updateContactInHrm } from '../../../services/ContactService';
import { completeTask, submitContactForm } from '../../../services/formSubmissionHelpers';
import { Case, Contact, CustomITask } from '../../../types/types';
import { ContactMetadata, ContactsState, LoadingStatus } from '../../../states/contacts/types';
import {
  connectToCaseAsyncAction,
  saveContactReducer,
  submitContactFormAsyncAction,
  updateContactInHrmAsyncAction,
} from '../../../states/contacts/saveContact';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import { initialState } from '../../../states/contacts/reducer';
import { getCase } from '../../../services/CaseService';
import { newContactMetaData } from '../../../states/contacts/contactState';

jest.mock('../../../services/ContactService');
jest.mock('../../../services/CaseService');
jest.mock('../../../services/formSubmissionHelpers');
jest.mock('../../../components/case/Case');

const mockUpdateContactInHrm = updateContactInHrm as jest.Mock<ReturnType<typeof updateContactInHrm>>;
const mockSubmitContactForm = submitContactForm as jest.Mock<ReturnType<typeof submitContactForm>>;
const mockConnectToCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;
const mockGetCase = connectToCase as jest.Mock<ReturnType<typeof getCase>>;
const mockCompleteTask = completeTask as jest.Mock<ReturnType<typeof completeTask>>;

beforeEach(() => {
  mockUpdateContactInHrm.mockReset();
  mockSubmitContactForm.mockReset();
  mockConnectToCase.mockReset();
  mockGetCase.mockReset();
  mockCompleteTask.mockReset();
});

const boundSaveContactReducer = saveContactReducer(initialState);

const testStore = (stateChanges: ContactsState) =>
  configureStore({
    preloadedState: { ...initialState, ...stateChanges },
    reducer: boundSaveContactReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

const baseContact: Contact = {
  id: '1337',
  profileId: 22,
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
    contactlessTask: { ...VALID_EMPTY_CONTACT.rawJson.contactlessTask, channel: 'web' },
  },
};

const task = <CustomITask>{ taskSid: 'mock task' };
const baseMetadata = { ...VALID_EMPTY_METADATA } as ContactMetadata;

const baseCase: Case = {
  accountSid: 'test-id',
  id: '213',
  helpline: 'za',
  status: 'test-st',
  twilioWorkerId: 'WE2xxx1',
  info: {},
  categories: {},
  createdAt: '12-05-2023',
  updatedAt: '12-05-2023',
  connectedContacts: [baseContact] as Contact[],
};

const baseState: ContactsState = {
  ...initialState,
  existingContacts: {
    [baseContact.id]: {
      savedContact: baseContact,
      references: new Set('x'),
      metadata: VALID_EMPTY_METADATA,
    },
  },
} as const;

// const dispatch = jest.fn();

describe('actions', () => {
  test('Calls the updateContactsFormInHrmAsyncAction action, and update a contact', async () => {
    const { dispatch, getState } = testStore(baseState);
    const startingState = getState();
    const startingContactState = startingState.existingContacts[baseContact.id];
    const mockSavedContact = { id: '12', ...VALID_EMPTY_CONTACT }; // Create a mock savedContact object
    mockUpdateContactInHrm.mockResolvedValue(mockSavedContact);

    await (dispatch(updateContactInHrmAsyncAction(baseContact, { conversationDuration: 1234 })) as unknown);
    const state = getState();

    expect(updateContactInHrm).toHaveBeenCalledWith(baseContact.id, { conversationDuration: 1234 });
    const expected: ContactsState = {
      ...baseState,
      existingContacts: {
        [baseContact.id]: {
          ...startingContactState,
          draftContact: undefined,
          savedContact: {
            ...startingContactState.savedContact,
            conversationDuration: 1234,
          },
          metadata: {
            ...startingContactState.metadata,
            loadingStatus: LoadingStatus.LOADING,
          },
        },
        [mockSavedContact.id]: {
          ...state.existingContacts[mockSavedContact.id],
        },
      },
    };

    expect(state).toStrictEqual(expected);
  });

  test('connectToCaseAsyncAction action connects contact to case and retrieves the connected case to add to redux along with the updated contact', async () => {
    const { dispatch, getState } = testStore(baseState);
    mockGetCase.mockResolvedValue(baseCase);
    const connectedContact = { ...baseContact, caseId: baseCase.id };
    mockConnectToCase.mockResolvedValue(connectedContact);
    // Not sure why the extra cast to any is needed here but not for the other actions?
    await (dispatch(connectToCaseAsyncAction(baseContact.id, baseCase.id) as any) as unknown);

    expect(connectToCase).toHaveBeenCalledWith(baseContact.id, baseCase.id);
    expect(getCase).toHaveBeenCalledWith(baseCase.id);
    const { metadata, savedContact } = getState().existingContacts[baseContact.id];
    expect(metadata.loadingStatus).toBe(LoadingStatus.LOADED);
    expect(savedContact).toStrictEqual(connectedContact);
  });
  describe('submitContactFormAsyncAction', () => {
    test('Action calls the submitContactForm helper', async () => {
      submitContactFormAsyncAction(task, baseContact, baseMetadata, baseCase);
      expect(submitContactForm).toHaveBeenCalledWith(task, baseContact, baseMetadata, baseCase);
    });

    test('Updates contact in redux and sets metadata', async () => {
      const { dispatch, getState } = testStore(baseState);
      mockGetCase.mockResolvedValue(baseCase);
      const updatedContact = { ...baseContact, helpline: 'new helpline' };
      mockSubmitContactForm.mockResolvedValue(updatedContact);
      // Not sure why the extra cast to any is needed here but not for the other actions?
      await (dispatch(submitContactFormAsyncAction(task, baseContact, baseMetadata, baseCase) as any) as unknown);
      const { metadata, savedContact } = getState().existingContacts[baseContact.id];

      // Check that the difference in startMillis is still insignificant
      expect(Math.abs(metadata.startMillis - newContactMetaData(false).startMillis)).toBeLessThanOrEqual(1);

      expect(metadata).toStrictEqual(expect.objectContaining({
        ...newContactMetaData(false),
        loadingStatus: LoadingStatus.LOADED,
        startMillis: expect.any(Number) 
      }));
      
      expect(savedContact).toStrictEqual(updatedContact);
    });
  });
});
