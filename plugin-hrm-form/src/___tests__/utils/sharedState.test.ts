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

import { transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import { getAseloFeatureFlags, getDefinitionVersions, getTemplateStrings } from '../../hrmConfig';
import { Contact } from '../../types/types';
import { ContactMetadata } from '../../states/contacts/types';
import { VALID_EMPTY_CONTACT } from '../testContacts';
import { RootState } from '../../states';
import { ContactState } from '../../states/contacts/existingContacts';
import { RecursivePartial } from '../RecursivePartial';
import { loadFormSharedState, saveFormSharedState, setUpSharedStateClient } from '../../utils/sharedState';

jest.mock('../../hrmConfig', () => ({
  getAseloFeatureFlags: jest.fn(),
  getTemplateStrings: () => ({
    SharedStateSaveFormError: 'Error saving',
    SharedStateLoadFormError: 'Error loading',
  }),
}));

jest.mock('../../states/contacts/existingContacts', () => ({
  ...jest.requireActual('../../states/contacts/existingContacts'),
  saveContactChangesInHrm: jest.fn(),
}));

jest.mock('../../states/contacts/actions', () => ({
  ...jest.requireActual('../../states/contacts/actions'),
  recreateContactState: jest.fn(),
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
const transferContactState = {
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

const mockFlexManager = {
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

const mockGetAseloFeatureFlags: jest.Mock = getAseloFeatureFlags as jest.Mock;
let mockSyncClient: jest.Mock = (SyncClient as unknown) as jest.Mock;
window.alert = jest.fn();
let mockV1;

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, buildBaseURL } = useFetchDefinitions();

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);
  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
});

beforeEach(() => {
  jest.resetAllMocks();
  mockSyncClient = (SyncClient as unknown) as jest.Mock;
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  (getTemplateStrings as jest.Mock).mockReturnValue({
    SharedStateSaveFormError: 'Error saving',
    SharedStateLoadFormError: 'Error loading',
  });
  (Manager.getInstance as jest.Mock).mockReturnValue(mockFlexManager);
  mockSharedStateDocuments = {};
  task.attributes.transferMeta = {
    originalTask: 'transferred-task-id',
  };
});

describe('Test with no feature flag', () => {
  test('saveFormSharedState', async () => {
    mockGetAseloFeatureFlags.mockReturnValue({});
    const { saveFormSharedState } = require('../../utils/sharedState');

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
  });

  test('loadFormSharedState', async () => {
    mockGetAseloFeatureFlags.mockReturnValue({});
    const { loadFormSharedState } = require('../../utils/sharedState');

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
  });
});

describe('Test with undefined sharedState', () => {
  test('saveFormSharedState', async () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
    expect(window.alert).toBeCalledWith('Error saving');
  });

  test('loadFormSharedState', async () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(window.alert).toBeCalledWith('Error loading');
  });
});

describe('Test with not connected sharedState', () => {
  beforeEach(async () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    mockSyncClient.mockImplementation(() => ({
      on: jest.fn(),
      connectionState: 'not connected',
    }));
    await setUpSharedStateClient();
  });

  test('saveFormSharedState', async () => {
    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
    expect(window.alert).toBeCalledWith('Error saving');
  });

  test('loadFormSharedState', async () => {
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(window.alert).toBeCalledWith('Error loading');
  });
});

describe('Test with connected sharedState', () => {
  beforeEach(async () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
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
        taskId: 'transferred-task-id',
      } as Contact,
    };
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toStrictEqual(expected);
  });
});

describe('Test throwing errors', () => {
  const error = jest.fn();
  console.error = error;

  beforeEach(async () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    mockSyncClient.mockImplementation(() => ({
      document: () => {
        throw new Error();
      },
      on: jest.fn(),
    }));
    await setUpSharedStateClient();
    error.mockReset();
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
    expect(loadedForm).toBeNull();
    expect(error).toBeCalled();
  });
});
