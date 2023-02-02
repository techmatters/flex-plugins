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

import { transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';
import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';
import { loadFormSharedState, saveFormSharedState, setUpSharedStateClient } from '../../utils/sharedState';
import { TaskEntry } from '../../states/contacts/reducer';

jest.mock('../../services/ServerlessService', () => ({
  issueSyncToken: jest.fn(),
}));
jest.mock('../../fullStory', () => ({
  recordBackendError: jest.fn(),
}));
jest.mock('../../hrmConfig', () => ({
  getAseloFeatureFlags: jest.fn(),
  getResourceStrings: () => ({
    SharedStateSaveFormError: 'Error saving',
    SharedStateLoadFormError: 'Error loading',
  }),
}));

jest.mock('twilio-sync', () => jest.fn());
const form = { helpline: 'a helpline' } as TaskEntry;
const task = createTask();

const mockSharedState = {
  connectionState: 'connected',
  documents: {},
  document: async documentName => {
    if (!mockSharedState.documents[documentName]) {
      mockSharedState.documents[documentName] = {
        set: async data => {
          mockSharedState.documents[documentName] = { data };
        },
      };
    }
    return mockSharedState.documents[documentName];
  },
};

const mockGetAseloFeatureFlags: jest.Mock = getAseloFeatureFlags as jest.Mock;
const mockSyncClient: jest.Mock = (SyncClient as unknown) as jest.Mock;
window.alert = jest.fn();

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
  beforeEach(() => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    mockSyncClient.mockImplementation(() => ({
      on: jest.fn(),
      connectionState: 'not connected',
    }));
    setUpSharedStateClient();
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
  beforeEach(() => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    mockSyncClient.mockImplementation(() => mockSharedState);
    setUpSharedStateClient();
  });

  test('saveFormSharedState', async () => {
    const expected = { ...form };
    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBe('pending-form-taskSid');
    expect(mockSharedState.documents[documentName].data).toStrictEqual(expected);
    await task.setAttributes({
      transferMeta: { transferStatus: transferStatuses.accepted, formDocument: documentName },
    });
  });

  test('loadFormSharedState', async () => {
    const expected = { ...form };
    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toStrictEqual(expected);
  });
});

describe('Test throwing errors', () => {
  const error = jest.fn();
  console.error = error;

  beforeEach(() => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_transfers: true });
    mockSyncClient.mockImplementation(() => ({
      document: () => {
        throw new Error();
      },
      on: jest.fn(),
    }));
    setUpSharedStateClient();
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
