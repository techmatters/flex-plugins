/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable global-require */
/* eslint-disable camelcase */
import { transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';

const form = { value1: 'value1', value2: 'value2' };
const task = createTask();

const mockSharedState = {
  connectionState: 'connected',
  documents: {},
  document: async documentName => {
    if (!mockSharedState.documents[documentName]) {
      mockSharedState.documents[documentName] = {
        set: async value => {
          mockSharedState.documents[documentName] = { value };
        },
      };
    }
    return mockSharedState.documents[documentName];
  },
};

const mockConfig1 = {
  featureFlags: {},
};

const mockConfig2 = {
  featureFlags: { enable_transfers: true },
  strings: {
    SharedStateSaveFormError: 'Error saving',
    SharedStateLoadFormError: 'Error loading',
  },
};

const mockConfig3 = {
  featureFlags: { enable_transfers: true },
  strings: {
    SharedStateSaveFormError: 'Error saving',
    SharedStateLoadFormError: 'Error loading',
  },
  sharedStateClient: {
    connectionState: 'not connected',
  },
};

const mockConfig4 = {
  featureFlags: { enable_transfers: true },
  sharedStateClient: mockSharedState,
};

const mockConfig5 = {
  featureFlags: { enable_transfers: true },
  sharedStateClient: {
    document: () => {
      throw new Error();
    },
  },
};

jest.mock('../../HrmFormPlugin', () => ({
  getConfig: jest
    .fn()
    .mockReturnValueOnce(mockConfig1)
    .mockReturnValueOnce(mockConfig1)
    .mockReturnValueOnce(mockConfig2)
    .mockReturnValueOnce(mockConfig2)
    .mockReturnValueOnce(mockConfig3)
    .mockReturnValueOnce(mockConfig3)
    .mockReturnValueOnce(mockConfig4)
    .mockReturnValueOnce(mockConfig4)
    .mockReturnValueOnce(mockConfig5)
    .mockReturnValueOnce(mockConfig5),
}));

describe('Test with no feature flag', () => {
  test('saveFormSharedState', async () => {
    const { saveFormSharedState } = require('../../utils/sharedState');

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
  });

  test('loadFormSharedState', async () => {
    const { loadFormSharedState } = require('../../utils/sharedState');

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
  });
});

window.alert = jest.fn();

describe('Test with undefined sharedState', () => {
  test('saveFormSharedState', async () => {
    const { saveFormSharedState } = require('../../utils/sharedState');

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
    expect(window.alert).toBeCalledWith('Error saving');
  });

  test('loadFormSharedState', async () => {
    const { loadFormSharedState } = require('../../utils/sharedState');

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(window.alert).toBeCalledWith('Error loading');
  });
});

describe('Test with not connected sharedState', () => {
  test('saveFormSharedState', async () => {
    const { saveFormSharedState } = require('../../utils/sharedState');

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
    expect(window.alert).toBeCalledWith('Error saving');
  });

  test('loadFormSharedState', async () => {
    const { loadFormSharedState } = require('../../utils/sharedState');

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(window.alert).toBeCalledWith('Error loading');
  });
});

describe('Test with connected sharedState', () => {
  test('saveFormSharedState', async () => {
    const { saveFormSharedState } = require('../../utils/sharedState');

    const expected = { ...form, metadata: { ...form.metadata, tab: 1 } };

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBe('pending-form-taskSid');
    expect(mockSharedState.documents[documentName].value).toStrictEqual(expected);
    await task.setAttributes({
      transferMeta: { transferStatus: transferStatuses.accepted, formDocument: documentName },
    });
  });

  test('loadFormSharedState', async () => {
    const { loadFormSharedState } = require('../../utils/sharedState');

    const expected = { ...form, metadata: { ...form.metadata, tab: 1 } };

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toStrictEqual(expected);
  });
});

describe('Test throwing errors', () => {
  const error = jest.fn();
  console.error = error;

  test('saveFormSharedState', async () => {
    const { saveFormSharedState } = require('../../utils/sharedState');

    const documentName = await saveFormSharedState(form, task);
    expect(documentName).toBeNull();
    expect(console.error).toBeCalled();
    error.mockReset();
  });

  test('loadFormSharedState', async () => {
    const { loadFormSharedState } = require('../../utils/sharedState');

    const loadedForm = await loadFormSharedState(task);
    expect(loadedForm).toBeNull();
    expect(console.error).toBeCalled();
    error.mockReset();
  });
});
