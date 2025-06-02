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

import '../../mockGetConfig';
import { connectToCase, getContactByTaskSid, updateContactInHrm } from '../../../services/ContactService';
import { completeTask, submitContactForm } from '../../../services/formSubmissionHelpers';
import { Case, Contact, CustomITask } from '../../../types/types';
import { ContactMetadata, ContactsState, LoadingStatus } from '../../../states/contacts/types';
import {
  connectToCaseAsyncAction,
  newLoadContactFromHrmForTaskAsyncAction,
  saveContactReducer,
  submitContactFormAsyncAction,
  updateContactInHrmAsyncAction,
} from '../../../states/contacts/saveContact';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import { initialState } from '../../../states/contacts/reducer';
import { getCase } from '../../../services/CaseService';
import { newContactMetaData } from '../../../states/contacts/contactState';
import { VALID_EMPTY_CASE, VALID_EMPTY_CASE_STATE_ENTRY } from '../../testCases';

jest.mock('../../../services/ContactService');
jest.mock('../../../services/CaseService');
jest.mock('../../../services/formSubmissionHelpers');
jest.mock('../../../components/case/Case');

const mockGetContactByTaskSid = getContactByTaskSid as jest.MockedFunction<typeof getContactByTaskSid>;
const mockUpdateContactInHrm = updateContactInHrm as jest.Mock<ReturnType<typeof updateContactInHrm>>;
const mockSubmitContactForm = submitContactForm as jest.Mock<ReturnType<typeof submitContactForm>>;
const mockConnectToCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;
const mockGetCase = getCase as jest.Mock<ReturnType<typeof getCase>>;
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
  ...VALID_EMPTY_CONTACT,
  id: '1337',
  profileId: 22,
  helpline: 'test helpline',
  taskId: 'WT-TASK_ID',
  rawJson: {
    callType: 'Child calling about self',
    caseInformation: {},
    childInformation: { firstName: 'Lorna', lastName: 'Ballantyne' },
    callerInformation: { firstName: 'Charlie', lastName: 'Ballantyne' },
    categories: {},
    contactlessTask: { ...VALID_EMPTY_CONTACT.rawJson.contactlessTask, channel: 'web' },
  },
};

const task = <ITask>(<unknown>{ taskSid: 'WT-mock task' });
const baseMetadata = { ...VALID_EMPTY_METADATA } as ContactMetadata;

const baseCase: Case = {
  ...VALID_EMPTY_CASE,
  accountSid: 'AC-test-id',
  id: '213',
  helpline: 'za',
  status: 'test-st',
  twilioWorkerId: 'WK2xxx1',
  info: {},
  createdAt: '12-05-2023',
  updatedAt: '12-05-2023',
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
  describe('loadContactFromHrmForTaskAsyncAction', () => {
    test('Finds a contact with no attached case - loads ', async () => {
      const { dispatch, getState } = testStore(baseState);
      const taskContact: Contact = {
        ...VALID_EMPTY_CONTACT,
        id: '666',
        taskId: 'WT-load-me',
      };
      mockGetContactByTaskSid.mockResolvedValue(taskContact);
      const actionPromiseResult = (dispatch(
        newLoadContactFromHrmForTaskAsyncAction(
          { taskSid: 'WT-load-me', attributes: {} } as CustomITask,
          'WK',
          'mock-ref',
        ),
      ) as unknown) as Promise<void>;
      const pendingState = getState();
      expect(pendingState.contactsBeingCreated.has('WT-load-me')).toBe(true);
      await actionPromiseResult;
      const state = getState();
      expect(state.contactsBeingCreated.has('WT-load-me')).toBe(false);
      expect(state.existingContacts['666'].savedContact).toEqual(taskContact);
      expect(state.existingContacts['666'].references.has('mock-ref')).toBe(true);
      expect(mockGetCase).not.toHaveBeenCalled();
      expect(mockGetContactByTaskSid).toHaveBeenCalledWith('WT-load-me');
    });
  });
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
      const caseState = {
        connectedCase: baseCase,
        sections: {},
        timelines: {},
        references: new Set<string>(),
        availableStatusTransitions: [],
        caseWorkingCopy: undefined,
        outstandingUpdateCount: 0,
      };
      submitContactFormAsyncAction(task, baseContact, baseMetadata, caseState);

      expect(submitContactForm).toHaveBeenCalledWith(task, baseContact, caseState);
    });
    test('Action sets the conversation duration', async () => {
      let conversatioonDurationPassedToSubmitContactForm: number | undefined;
      mockSubmitContactForm.mockImplementation((task, contact) => {
        conversatioonDurationPassedToSubmitContactForm = contact.conversationDuration;
        return Promise.resolve(contact);
      });
      const caseState = {
        connectedCase: baseCase,
        sections: {},
        timelines: {},
        references: new Set<string>(),
        availableStatusTransitions: [],
        caseWorkingCopy: undefined,
        outstandingUpdateCount: 0,
      };
      submitContactFormAsyncAction(
        task,
        baseContact,
        { ...baseMetadata, startMillis: Date.now() - 1000 * 100 },
        caseState,
      );

      // The conversation duration should
      expect(submitContactForm).toHaveBeenCalledWith(
        task,
        { ...baseContact, conversationDuration: expect.any(Number) },
        caseState,
      );
      expect(conversatioonDurationPassedToSubmitContactForm).toBeGreaterThanOrEqual(100);
    });

    test('Updates contact in redux and sets metadata', async () => {
      const { dispatch, getState } = testStore(baseState);
      mockGetCase.mockResolvedValue(baseCase);
      const updatedContact = { ...baseContact, helpline: 'new helpline' };
      mockSubmitContactForm.mockResolvedValue(updatedContact);
      // Not sure why the extra cast to any is needed here but not for the other actions?
      await (dispatch(
        submitContactFormAsyncAction(task, baseContact, baseMetadata, {
          ...VALID_EMPTY_CASE_STATE_ENTRY,
          connectedCase: baseCase,
        }) as any,
      ) as unknown);
      const { metadata, savedContact } = getState().existingContacts[baseContact.id];
      // Check that the difference in startMillis is still insignificant
      expect(Math.abs(metadata.startMillis - newContactMetaData(false).startMillis)).toBeLessThanOrEqual(100);
      expect(metadata).toStrictEqual(
        expect.objectContaining({
          ...newContactMetaData(false),
          loadingStatus: LoadingStatus.LOADED,
          startMillis: expect.any(Number),
        }),
      );

      expect(savedContact).toStrictEqual(updatedContact);
    });
  });
});
