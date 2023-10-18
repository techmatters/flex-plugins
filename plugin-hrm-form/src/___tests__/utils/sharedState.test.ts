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
import SyncClient from 'twilio-sync';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';
import { Manager } from '@twilio/flex-ui';

import { baseMockConfig, mockGetDefinitionsResponse } from '../mockGetConfig';
import { transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';
import { getDefinitionVersions } from '../../hrmConfig';
import { ContactState } from '../../states/contacts/existingContacts';
import { Contact } from '../../types/types';
import { ContactMetadata } from '../../states/contacts/types';
import { VALID_EMPTY_CONTACT } from '../testContacts';
import { RootState } from '../../states';
import { RecursivePartial } from '../RecursivePartial';
import { loadFormSharedState, saveFormSharedState, setUpSharedStateClient } from '../../utils/sharedState';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';

jest.mock('../../states/contacts/saveContact', () => ({
  ...jest.requireActual('../../states/contacts/saveContact'),
  updateContactInHrmAsyncAction: jest.fn((id, contact, _, task) => {
    console.log('updateContactInHrmAsyncAction', id, contact, task);
    return Promise.resolve();
  }),
}));

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../services/ServerlessService', () => ({
  issueSyncToken: jest.fn(),
}));
jest.mock('../../fullStory', () => ({
  recordBackendError: jest.fn(),
}));

jest.mock('twilio-sync', () => jest.fn());
let transferContactState;

let mockFlexManager;

const contact = { helpline: 'a helpline' } as Contact;
const metadata = {} as ContactMetadata;
const form: ContactState = {
  savedContact: contact,
  metadata,
  references: new Set(),
};
const task = createTask();

let mockSharedStateDocuments;

const mockSharedState = {
  connectionState: 'connected',
  document: async documentName => {
    console.log('mockSharedState.document', documentName);
    if (!mockSharedStateDocuments[documentName]) {
      console.log('mockSharedState.document.create', documentName);
      return {
        set: async data => {
          console.log('mockSharedState.document.set', documentName, data);
          mockSharedStateDocuments[documentName] = { data };
          return data;
        },
      };
    }
    console.log('mockSharedState.document.get', documentName, mockSharedStateDocuments[documentName]);
    return mockSharedStateDocuments[documentName];
  },
};

let mockSyncClient: jest.Mock = (SyncClient as unknown) as jest.Mock;
let mockV1;

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, buildBaseURL } = useFetchDefinitions();

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);
  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockSyncClient = (SyncClient as unknown) as jest.Mock;
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

beforeEach(async () => {
  jest.clearAllMocks();
  mockSharedStateDocuments = {};
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
    references: new Set<string>(),
  };

  mockFlexManager = {
    store: {
      getState: (): RecursivePartial<RootState> => ({
        'plugin-hrm-form': {
          activeContacts: {
            existingContacts: {
              12345: transferContactState as ContactState,
            },
          },
        },
      }),
      dispatch: jest.fn(),
    },
  };
  (Manager.getInstance as jest.Mock).mockReturnValue(mockFlexManager);
  await task.setAttributes({
    transferMeta: {
      originalTask: 'transferred-task-id',
    },
  });
});
describe('sharedState', () => {
  describe('Test with no feature flag', () => {
    test('saveFormSharedState', async () => {
      baseMockConfig.featureFlags.enable_transfers = false;
      const { saveFormSharedState } = require('../../utils/sharedState');

      const documentName = await saveFormSharedState(form, task);
      expect(documentName).toBeNull();
    });

    test('loadFormSharedState', async () => {
      baseMockConfig.featureFlags.enable_transfers = false;
      const { loadFormSharedState } = require('../../utils/sharedState');

      const loadedForm = await loadFormSharedState(task);
      expect(loadedForm).toBeNull();
    });
  });

  describe('Test with undefined sharedState', () => {
    test('saveFormSharedState', async () => {
      baseMockConfig.featureFlags.enable_transfers = true;
      const documentName = await saveFormSharedState(form, task);
      expect(documentName).toBeNull();
    });

    test('loadFormSharedState', async () => {
      baseMockConfig.featureFlags.enable_transfers = true;

      const loadedForm = await loadFormSharedState(task);
      expect(loadedForm).toBe(transferContactState);
    });
  });

  describe('Test with not connected sharedState', () => {
    beforeEach(async () => {
      baseMockConfig.featureFlags.enable_transfers = true;
      mockSyncClient.mockImplementation(() => ({
        on: jest.fn(),
        connectionState: 'not connected',
      }));
      await setUpSharedStateClient();
    });

    test('saveFormSharedState', async () => {
      const documentName = await saveFormSharedState(form, task);
      expect(documentName).toBeNull();
    });

    test('loadFormSharedState', async () => {
      const loadedForm = await loadFormSharedState(task);
      expect(loadedForm).toBe(transferContactState);
    });
  });

  describe('Test with connected sharedState', () => {
    beforeEach(async () => {
      baseMockConfig.featureFlags.enable_transfers = true;
      mockSyncClient.mockImplementation(() => mockSharedState);
      await setUpSharedStateClient();
    });

    test('saveFormSharedState', async () => {
      const expected = {
        helpline: 'a helpline',
        categories: undefined,
        csamReports: undefined,
        draft: undefined,
        metadata: {},
        referrals: undefined,
      };
      const documentName = await saveFormSharedState(form, task);
      expect(documentName).toBe('pending-form-taskSid');
      expect(mockSharedStateDocuments[documentName].data).toStrictEqual(expected);
      await task.setAttributes({
        transferMeta: { transferStatus: transferStatuses.accepted, formDocument: documentName },
      });
    });

    test('loadFormSharedState', async () => {
      const expected: ContactState = {
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
          formDocument: 'pending-form-transferred-task-id',
        },
      });
      mockSharedStateDocuments['pending-form-transferred-task-id'] = {
        data: {
          categories: undefined,
          contactlessTask: undefined,
          draft: undefined,
          helpline: 'a helpline',
        },
      };
      const loadedForm = await loadFormSharedState(task);
      expect(loadedForm).toStrictEqual(expected);
    });
  });

  describe('Test throwing errors', () => {
    const error = jest.fn();
    console.error = error;

    beforeEach(async () => {
      baseMockConfig.featureFlags.enable_transfers = true;
      mockSyncClient.mockImplementation(() => ({
        document: () => {
          throw new Error();
        },
        on: jest.fn(),
      }));
      await setUpSharedStateClient();
      error.mockClear();
    });

    test('saveFormSharedState', async () => {
      expect(error).not.toBeCalled();
      const documentName = await saveFormSharedState(form, task);
      expect(documentName).toBeNull();
      expect(error).toBeCalled();
    });

    test('loadFormSharedState', async () => {
      expect(error).not.toBeCalled();
      const loadedForm = await loadFormSharedState(task);
      expect(loadedForm).toBe(transferContactState);
      expect(error).toBeCalled();
    });
  });
});
