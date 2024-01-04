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

/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable global-require */
/* eslint-disable camelcase */
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';
import { Manager } from '@twilio/flex-ui';

import { baseMockConfig, mockGetDefinitionsResponse } from '../mockGetConfig';
import { createTask } from '../helpers';
import { getDefinitionVersions } from '../../hrmConfig';
import { ContactState } from '../../states/contacts/existingContacts';
import { Case, Contact } from '../../types/types';
import { ContactMetadata } from '../../states/contacts/types';
import { VALID_EMPTY_CONTACT } from '../testContacts';
import { connectToCaseAsyncAction, updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { loadFormSharedState, saveFormSharedState } from '../../transfer/formDataTransfer';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';

jest.mock('../../states/contacts/saveContact', () => ({
  ...jest.requireActual('../../states/contacts/saveContact'),
  updateContactInHrmAsyncAction: jest.fn((id, contact, _, task) => {
    return Promise.resolve();
  }),
  connectToCaseAsyncAction: jest.fn((id, caseId) => {
    return Promise.resolve();
  }),
}));

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../fullStory', () => ({
  recordBackendError: jest.fn(),
}));

let transferContactState;

let mockFlexManager;

const contact = { helpline: 'a helpline' } as Contact;
const metadata = {} as ContactMetadata;
const contactState: ContactState = {
  savedContact: contact,
  metadata,
  references: new Set(),
};
const task = createTask();

let mockV1;

const mockUpdateContactInHrmAsyncAction = updateContactInHrmAsyncAction as jest.MockedFunction<
  typeof updateContactInHrmAsyncAction
>;

const mockConnectToCaseAsyncAction = connectToCaseAsyncAction as jest.MockedFunction<typeof connectToCaseAsyncAction>;

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, buildBaseURL } = useFetchDefinitions();

const mockGetState = jest.fn();

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);
  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

beforeEach(async () => {
  jest.clearAllMocks();
  transferContactState = {
    savedContact: {
      ...VALID_EMPTY_CONTACT,
      rawJson: {
        categories: undefined,
        contactlessTask: undefined,
        draft: undefined,
      } as any,
      timeOfContact: new Date().toISOString(),
      csamReports: undefined,
      referrals: undefined,
      helpline: 'a helpline',
      channel: 'web',
      taskId: 'transferred-task-id',
    },
    metadata: {
      draft: undefined,
    } as ContactMetadata,
    references: new Set<string>(['task-transferred-task-id']),
  };

  mockUpdateContactInHrmAsyncAction.mockImplementation((previousContact, changes, reference) => ({
    type: 'contact-action/update-contact',
    payload: Promise.resolve({ previousContact, contact: getUnsavedContact(previousContact, changes), reference }),
    meta: { previousContact, changes },
  }));

  mockConnectToCaseAsyncAction.mockImplementation((contactId, caseId) => ({
    type: 'contact-action/connect-to-case',
    payload: Promise.resolve({
      contactId,
      caseId,
      contact: { id: contactId, caseId } as Contact,
      contactCase: { id: caseId } as Case,
    }),
    meta: {},
  }));

  mockGetState.mockReturnValue({
    'plugin-hrm-form': {
      activeContacts: {
        existingContacts: {
          12345: transferContactState as ContactState,
        },
      },
    },
  });

  mockFlexManager = {
    store: {
      getState: mockGetState,
      dispatch: jest.fn(),
    },
  };
  (Manager.getInstance as jest.Mock).mockReturnValue(mockFlexManager);
  await task.setAttributes({
    transferMeta: {
      originalTask: 'transferred-task-id',
    },
  });
  baseMockConfig.featureFlags.enable_transfers = true;
});

describe('saveFormSharedState', () => {
  test('flag disabled - does nothing', async () => {
    baseMockConfig.featureFlags.enable_transfers = false;

    await saveFormSharedState(
      {
        ...contactState,
        savedContact: { ...contactState.savedContact, caseId: '1234' },
        draftContact: { channel: 'whatsapp' },
      },
      task,
    );
    expect(updateContactInHrmAsyncAction).not.toHaveBeenCalled();
    expect(connectToCaseAsyncAction).not.toHaveBeenCalled();
  });

  test('Has draft changes - should save them', async () => {
    await saveFormSharedState({ ...contactState, draftContact: { channel: 'whatsapp' } }, task);
    expect(updateContactInHrmAsyncAction).toHaveBeenCalledWith(
      contactState.savedContact,
      { channel: 'whatsapp' },
      'task-taskSid',
    );
    expect(connectToCaseAsyncAction).not.toHaveBeenCalled();
  });

  test('Has case ID set - should disconnect it', async () => {
    await saveFormSharedState(
      { ...contactState, savedContact: { ...contactState.savedContact, caseId: '1234' } },
      task,
    );
    expect(updateContactInHrmAsyncAction).not.toHaveBeenCalled();
    expect(connectToCaseAsyncAction).toHaveBeenCalledWith(contactState.savedContact.id, undefined);
  });

  test('Has case ID set and draft changes - should disconnect the case and save the changes', async () => {
    await saveFormSharedState(
      {
        ...contactState,
        savedContact: { ...contactState.savedContact, caseId: '1234' },
        draftContact: { channel: 'whatsapp' },
      },
      task,
    );
    expect(updateContactInHrmAsyncAction).toHaveBeenCalledWith(
      { ...contactState.savedContact, caseId: '1234' },
      { channel: 'whatsapp' },
      'task-taskSid',
    );
    expect(connectToCaseAsyncAction).toHaveBeenCalledWith(contactState.savedContact.id, undefined);
  });

  test('Has no case ID set and draft changes - should disconnect the case and save the changes', async () => {
    await saveFormSharedState(contactState, task);
    expect(updateContactInHrmAsyncAction).not.toHaveBeenCalled();
    expect(connectToCaseAsyncAction).not.toHaveBeenCalled();
  });

  test('HRM update endpoint errors - still disconnects case', async () => {
    const changes = { channel: 'whatsapp' } as const;
    const contact = { ...contactState.savedContact, caseId: '1234' };
    const updateAction = {
      type: 'contact-action/update-contact',
      payload: Promise.reject(new Error('update error')),
      meta: { previousContact: contact, changes },
    } as const;
    mockUpdateContactInHrmAsyncAction.mockReturnValue(updateAction);
    await saveFormSharedState({ ...contactState, savedContact: contact, draftContact: changes }, task);
    expect(connectToCaseAsyncAction).toHaveBeenCalledWith(contactState.savedContact.id, undefined);
    // Bit weird to assert a mocked value here, but it confirms the rejection case we are testing actually occurs
    // It also prevents an unhandled error bubbling up to the top level of the test suite and failing it
    await expect(updateAction.payload).rejects.toEqual(new Error('update error'));
  });

  test('HRM disconnect endpoint errors - still updates contact', async () => {
    const changes = { channel: 'whatsapp' } as const;
    const contact = { ...contactState.savedContact, caseId: '1234' };
    const connectAction = {
      type: 'contact-action/connect-to-case',
      payload: Promise.reject(new Error('disconnect error')),
      meta: {},
    } as const;
    mockConnectToCaseAsyncAction.mockReturnValue(connectAction);
    await saveFormSharedState({ ...contactState, savedContact: contact, draftContact: changes }, task);
    expect(connectToCaseAsyncAction).toHaveBeenCalledWith(contactState.savedContact.id, undefined);
    // Bit weird to assert a mocked value here, but it confirms the rejection case we are testing actually occurs
    // It also prevents an unhandled error bubbling up to the top level of the test suite and failing it
    await expect(connectAction.payload).rejects.toEqual(new Error('disconnect error'));
  });
});
describe('loadFormSharedState', () => {
  let expected: ContactState;

  beforeEach(async () => {
    expected = {
      ...transferContactState,
      savedContact: {
        ...transferContactState.savedContact,
        timeOfContact: expect.any(String),
        taskId: 'taskSid',
      } as Contact,
    };
    await task.setAttributes({
      transferMeta: {
        originalTask: 'transferred-task-id',
      },
    });
  });

  test('Flag disabled - does nothing', async () => {
    baseMockConfig.featureFlags.enable_transfers = false;
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(updateContactInHrmAsyncAction).not.toHaveBeenCalled();
  });

  test('Should save the contact back to HRM with the tasks current task SID', async () => {
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toStrictEqual(expected);
    expect(updateContactInHrmAsyncAction).toHaveBeenCalledWith(
      expected.savedContact,
      expected.savedContact,
      'task-taskSid',
    );
  });

  test('HRM update endpoint errors - does nothing & returns original state', async () => {
    const updateAction = {
      type: 'contact-action/update-contact',
      payload: Promise.reject(new Error('update error')),
      meta: { previousContact: expected.savedContact, changes: expected.savedContact },
    } as const;

    mockUpdateContactInHrmAsyncAction.mockReturnValue(updateAction);
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toEqual(transferContactState);

    expect(updateContactInHrmAsyncAction).toHaveBeenCalledWith(
      expected.savedContact,
      expected.savedContact,
      'task-taskSid',
    );
    await expect(updateAction.payload).rejects.toEqual(new Error('update error'));
  });
});
