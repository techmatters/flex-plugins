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

import { callTypes, DefinitionVersionId, loadDefinition } from '@tech-matters/hrm-form-definitions';
import { TaskHelper } from '@twilio/flex-ui';

import { mockLocalFetchDefinitions } from '../mockFetchDefinitions';
import { baseMockConfig as mockBaseConfig, mockGetDefinitionsResponse } from '../mockGetConfig';
import { finalizeContact, handleTwilioTask, saveContact, updateContactInHrm } from '../../services/ContactService';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions, getHrmConfig } from '../../hrmConfig';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../testContacts';
import { ContactState } from '../../states/contacts/existingContacts';

const helpline = 'ChildLine';
const mockGetHrmConfig = getHrmConfig as jest.Mock;

// eslint-disable-next-line no-empty-function
global.fetch = global.fetch ? global.fetch : () => Promise.resolve(<any>{ ok: true });

jest.mock('../../services/formSubmissionHelpers', () => ({
  getHelplineToSave: () => ({
    helpline: Promise.resolve(helpline),
  }),
}));

jest.mock('../../services/ServerlessService', () => ({
  getExternalRecordingS3Location: () =>
    Promise.resolve({
      status: 'success',
      recordingSid: 'recordingSid',
      bucket: 'bucket',
      key: 'key',
    }),
}));

jest.mock('@twilio/flex-ui', () => ({
  __esModule: true,
  ...(<any>jest.requireActual('@twilio/flex-ui')),
  TaskHelper: {
    isChatBasedTask: () => true,
  },
}));

jest.mock('../../authentication', () => ({
  getValidToken: () => 'valid token',
}));

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

let mockV1;

beforeEach(() => {
  mockReset();
});

const offlineContactTaskSid = 'offline-contact-task-workerSid';

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

const createContactState = ({ callType, childFirstName }, contactlessTaskInfo = undefined): ContactState => {
  const blankForm = VALID_EMPTY_CONTACT.rawJson;
  const contactlessTask = contactlessTaskInfo || blankForm.contactlessTask;

  return {
    metadata: VALID_EMPTY_METADATA,
    savedContact: {
      ...VALID_EMPTY_CONTACT,
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType,
        childInformation: {
          ...blankForm.childInformation,
          firstName: childFirstName,
        },
        contactlessTask,
      },
    },
    references: new Set(),
  };
};

const getFormFromPATCH = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).rawJson;
const getNumberFromPATCH = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).number;

describe('saveContact()', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: false, preEngagementData: { contactType: 'ip', contactIdentifier: 'ip-address' } },
  };
  const workerSid = 'WK-worker-sid';
  const uniqueIdentifier = 'WT-uniqueIdentifier';
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn(), text: jest.fn() });

  test('data calltype saves form data', async () => {
    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, savedContact, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPATCH(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data', async () => {
    const { savedContact } = createContactState({ callType: 'hang up', childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, savedContact, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPATCH(mockedFetch);
    expect(formFromPOST.callType).toEqual('hang up');
    expect(formFromPOST.childInformation.firstName).toEqual('');

    mockedFetch.mockClear();
  });
});

describe('saveContact() (isContactlessTask)', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: true },
  };
  const workerSid = 'WK-worker-sid';
  const uniqueIdentifier = 'WT-uniqueIdentifier';
  const fetchJson = jest.fn();
  const fetchSuccess = Promise.resolve(<any>{
    ok: true,
    json: fetchJson,
    text: jest.fn(),
    headers: { get: header => ({ 'Content-Type': 'application/json' }[header]) },
  });
  let mockedFetch;

  beforeEach(() => {
    mockedFetch = jest.spyOn(global, 'fetch').mockImplementation((...args) => {
      console.log('Mock fetch called', ...args);
      return fetchSuccess;
    });
  });

  afterEach(() => {
    mockedFetch.mockClear();
  });

  test('data calltype saves form data', async () => {
    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' }, { channel: '' });
    fetchJson.mockResolvedValue([]).mockResolvedValue({ ...savedContact, id: 'contact-id' });
    await saveContact(task, savedContact, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPATCH(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');
  });

  test('non-data calltype do not save form data (but captures contactlessTask info)', async () => {
    const contactlessTask = { channel: 'web', createdOnBehalfOf: 'someone else' };
    const { savedContact } = createContactState({ callType: 'hang up', childFirstName: 'Jill' }, contactlessTask);
    await saveContact({ ...task, taskSid: offlineContactTaskSid }, savedContact, workerSid, uniqueIdentifier);

    const expected = { ...contactlessTask };

    const formFromPOST = getFormFromPATCH(mockedFetch);
    expect(formFromPOST.callType).toEqual('hang up');
    expect(formFromPOST.childInformation.firstName).toEqual('');
    expect(formFromPOST.contactlessTask).toStrictEqual(expected);
  });

  test('save IP from web calltype', async () => {
    const ip = 'ip-address';
    const webTaskWithIP = {
      queueName: 'queueName',
      channelType: channelTypes.web,
      defaultFrom: 'Anonymous',
      attributes: {
        isContactlessTask: false,
        ip,
        preEngagementData: { contactType: 'ip', contactIdentifier: ip },
      },
    };
    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithIP, savedContact, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPATCH(mockedFetch);
    expect(numberFromPOST).toEqual(ip);
  });

  test('save email from web calltype', async () => {
    const email = 'abc@email.com';
    const webTaskWithIP = {
      queueName: 'queueName',
      channelType: channelTypes.web,
      defaultFrom: 'Anonymous',
      attributes: {
        isContactlessTask: false,
        ip: '',
        preEngagementData: { contactType: 'email', contactIdentifier: email },
      },
    };
    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(webTaskWithIP, savedContact, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPATCH(mockedFetch);
    expect(numberFromPOST).toEqual(email);

    mockedFetch.mockClear();
  });

  test('save empty string when IP is null from web calltype', async () => {
    const defaultFrom = 'Anonymous';
    const webTaskWithoutIP = {
      queueName: 'queueName',
      channelType: channelTypes.web,
      defaultFrom,
      attributes: {
        isContactlessTask: false,
        ip: '', // Studio makes it empty string
      },
    };
    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithoutIP, savedContact, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPATCH(mockedFetch);
    expect(numberFromPOST).toEqual('');
  });
});

describe('finalizeContact() (externalRecording)', () => {
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn(), text: jest.fn() });
  let mockedFetch;

  beforeEach(() => {
    mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);
  });

  afterEach(() => {
    mockedFetch.mockClear();
  });

  beforeAll(() => {
    mockGetHrmConfig.mockReturnValue({
      ...mockBaseConfig,
      externalRecordingsEnabled: true,
    });

    TaskHelper.isChatBasedTask = () => false;
    TaskHelper.isCallTask = () => true;
  });

  afterAll(() => {
    jest.unmock('../../hrmConfig');
    jest.unmock('@twilio/flex-ui');
  });

  test('should send conversatonMedia when external recording is enabled', async () => {
    const task = {
      taskSid: 'taskSid',
      channelType: channelTypes.voice,
      attributes: {
        conference: {
          participants: {
            worker: {
              callSid: 'callSid',
            },
          },
        },
      },
    };

    const { savedContact } = createContactState({ callType: callTypes.child, childFirstName: 'Jill' });
    await finalizeContact(task, savedContact);

    const conversationMediaPostRequestBody = JSON.parse(mockedFetch.mock.calls[0][1].body);
    expect(conversationMediaPostRequestBody).toStrictEqual([
      { storeType: 'twilio', storeTypeSpecificData: {} },
      {
        storeType: 'S3',
        storeTypeSpecificData: {
          type: 'recording',
          location: {
            bucket: 'bucket',
            key: 'key',
          },
        },
      },
    ]);
  });
});

test('updateContactInHrm - calls a PATCH HRM endpoint using the supplied contact ID in the route', async () => {
  const responseBody = { id: 1234, rawJson: { caseInformation: {}, categories: {} } };
  const mockedFetch = jest.spyOn(global, 'fetch').mockResolvedValue(<Response>(<unknown>{
    ok: true,
    json: () => Promise.resolve(responseBody),
    text: () => Promise.resolve(responseBody),
  }));
  try {
    const inputPatch = { rawJson: { caseInformation: {}, categories: {} } };
    const ret = await updateContactInHrm('1234', inputPatch);
    expect(ret).toStrictEqual({
      ...inputPatch,
      id: '1234',
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts/1234'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(inputPatch),
      }),
    );
  } finally {
    mockedFetch.mockClear();
  }
});

describe('handleTwilioTask() (externalRecording)', () => {
  // eslint-disable-next-line sonarjs/no-identical-functions
  beforeAll(() => {
    mockGetHrmConfig.mockReturnValue({
      ...mockBaseConfig,
      externalRecordingsEnabled: true,
    });

    TaskHelper.isChatBasedTask = () => false;
    TaskHelper.isCallTask = () => true;
  });

  afterAll(() => {
    jest.unmock('../../hrmConfig');
    jest.unmock('@twilio/flex-ui');
  });

  test('should return conversationMedia with correct data if external recording is enabled', async () => {
    const task = {
      taskSid: 'taskSid',
      channelType: channelTypes.voice,
      attributes: {
        conference: {
          participants: {
            worker: {
              callSid: 'callSid',
            },
          },
        },
      },
    };

    const result = await handleTwilioTask(task);
    expect(result).toStrictEqual({
      conversationMedia: [
        {
          storeType: 'twilio',
          storeTypeSpecificData: {
            reservationSid: undefined,
          },
        },
        {
          storeType: 'S3',
          storeTypeSpecificData: {
            type: 'recording',
            location: {
              bucket: 'bucket',
              key: 'key',
            },
          },
        },
      ],
      externalRecordingInfo: {
        status: 'success',
        recordingSid: 'recordingSid',
        bucket: 'bucket',
        key: 'key',
      },
    });
  });

  test('should return conversationMedia with correct data if external recording is enabled', async () => {
    const task = {
      taskSid: 'taskSid',
      channelType: channelTypes.voice,
      attributes: {},
    };

    const returnData = await handleTwilioTask(task);
    expect(returnData).toStrictEqual({
      conversationMedia: [{ storeType: 'twilio', storeTypeSpecificData: { reservationSid: undefined } }],
    });
  });
});
