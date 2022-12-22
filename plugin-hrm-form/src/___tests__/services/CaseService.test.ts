import { callTypes, DefinitionVersionId } from 'hrm-form-definitions';

import { cancelCase, createCase } from '../../services/CaseService';
import fetchHrmApi from '../../services/fetchHrmApi';
import { OfflineContactTask } from '../../types/types';
import { TaskEntry } from '../../states/contacts/reducer';

jest.mock('../../services/fetchHrmApi');
const mockFetchHrmAPi: jest.Mock = fetchHrmApi as jest.Mock;

const jsonStringToParseAs = (actual: string, expected: any) => {
  try {
    const parsed = JSON.parse(actual);
    expect(parsed).toStrictEqual(expected);
  } catch (err) {
    return { pass: false, message: () => err.message() };
  }
  return { pass: true, message: () => 'JSON string parses as expected object' };
};

declare global {
  namespace jest {
    interface Matchers<R> {
      jsonStringToParseAs(expected: any): R;
    }
    // @ts-ignore
    interface Expect<R> {
      jsonStringToParseAs(expected: any): R;
    }
  }
}

expect.extend({ jsonStringToParseAs });

beforeEach(() => {
  mockFetchHrmAPi.mockClear();
});

describe('cancelCase()', () => {
  test('cancelCase calls "DELETE /cases/id', async () => {
    const caseId = 1;

    await cancelCase(caseId);

    const expectedUrl = `/cases/${caseId}`;
    const expectedOptions = { method: 'DELETE' };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  });
});

describe('createCase()', () => {
  const baselineContactForm: TaskEntry = {
    helpline: 'a helpline',
    callType: callTypes.child,
    contactlessTask: {
      channel: 'voice',
      createdOnBehalfOf: 'owning worker',
    },
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    categories: [],
    csamReports: [],
    isCallTypeCaller: false,
    metadata: { startMillis: 0, endMillis: 0, categories: { gridView: false, expanded: {} }, recreated: false },
  };

  describe('Offline contact', () => {
    const offlineContact: OfflineContactTask = {
      channelType: 'default',
      taskSid: 'offline-contact-task-sid',
      attributes: {
        isContactlessTask: true,
        channelType: 'default',
      },
    };

    const baselineResponse = {
      id: 1,
      createdAt: '2022-12-22T07:20:17.042Z',
      updatedAt: '2022-12-22T07:20:17.042Z',
      status: 'open',
      helpline: 'a helpline',
      info: { definitionVersion: 'demo-v1', offlineContactCreator: 'creating worker' },
      twilioWorkerId: 'owning worker',
      accountSid: 'an account',
      createdBy: 'creating worker',
      updatedBy: null,
      childName: '',
      categories: {},
    };

    test('createCase calls "POST /cases with offlineContactCreator set to creating worker and twilioWorkerId set to owning worker', async () => {
      const caseId = 1;

      mockFetchHrmAPi.mockResolvedValue(baselineResponse);

      const response = await createCase(
        offlineContact,
        baselineContactForm,
        'creating worker',
        DefinitionVersionId.demoV1,
      );

      const expectedUrl = `/cases`;
      const expectedOptions = {
        method: 'POST',
        body: expect.jsonStringToParseAs({
          twilioWorkerId: 'owning worker',
          status: 'open',
          helpline: 'a helpline',
          info: {
            definitionVersion: DefinitionVersionId.demoV1,
            offlineContactCreator: 'creating worker',
          },
        }),
      };
      expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
      expect(response).toStrictEqual(baselineResponse);
    });
  });
});
