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

import {
  callTypes,
  CategoriesDefinition,
  CategoryEntry,
  DefinitionVersion,
  DefinitionVersionId,
  FormInputType,
  loadDefinition,
  useFetchDefinitions,
} from 'hrm-form-definitions';
import { TaskHelper } from '@twilio/flex-ui';

import { baseMockConfig as mockBaseConfig, mockGetDefinitionsResponse } from '../mockGetConfig';
import {
  handleTwilioTask,
  saveContact,
  transformCategories,
  transformForm,
  transformValues,
  updateContactsFormInHrm,
} from '../../services/ContactService';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions, getHrmConfig } from '../../hrmConfig';
import { ContactRawJson, offlineContactTaskSid } from '../../types/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../testContacts';
import { HrmServiceContactWithMetadata } from '../../states/contacts/types';

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

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

/**
 * Adds a category with the corresponding subcategories set to false to the provided object (obj)
 */
const createCategory = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory.label]: false }), {}),
});

const createCategoriesObject = (
  categoriesFormDefinition: CategoriesDefinition,
): Record<string, Record<string, boolean>> => Object.entries(categoriesFormDefinition).reduce(createCategory, {});

let mockV1;

beforeEach(() => {
  mockReset();
});

let EMPTY_API_CATEGORIES: Record<string, Record<string, boolean>>;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  EMPTY_API_CATEGORIES = createCategoriesObject(mockV1.tabbedForms.IssueCategorizationTab(helpline));
});

describe('transformForm', () => {
  test('removes control information and presents values only', () => {
    const oldForm: ContactRawJson = {
      callType: callTypes.caller,
      callerInformation: {
        firstName: 'myFirstName',
        lastName: '',
      },
      childInformation: {
        firstName: 'child',
        lastName: '',
        gender: 'Male',
        refugee: false,
      },
      categories: {
        Abuse: ['Abduction'],
      },
      caseInformation: {
        callSummary: 'My summary',
      },
      contactlessTask: {
        channel: channelTypes.web,
        date: '',
        time: '',
        createdOnBehalfOf: undefined,
      },
    };

    const expectedCategories = {
      ...EMPTY_API_CATEGORIES,
      Abuse: {
        ...EMPTY_API_CATEGORIES.Abuse,
        Abduction: true,
      },
    };

    const expected = {
      definitionVersion: 'v1',
      callType: callTypes.caller,
      callerInformation: { name: { firstName: 'myFirstName', lastName: '' } },
      childInformation: {
        gender: 'Male',
        name: { firstName: 'child', lastName: '' },
      },
      caseInformation: {
        // copy paste from ContactService. This will come from redux later on and we can mockup definitions
        callSummary: 'My summary',
        categories: expectedCategories,
      },
      contactlessTask: {
        channel: '',
        date: '',
        time: '',
      },
      metadata: {},
    };

    const transformed = transformForm(oldForm, helpline);
    // expect().toStrictEqual(expected);

    expect(transformed.definitionVersion).toBe('v1');
    expect(transformed.callType).toBe(callTypes.caller);
    expect(transformed.callerInformation.firstName).toBe('myFirstName');
    expect(transformed.callerInformation.lastName).toBe('');
    expect(transformed.childInformation.gender).toBe('Male');
    expect(transformed.childInformation.firstName).toBe('child');
    expect(transformed.childInformation.lastName).toBe('');
    expect(transformed.caseInformation.categories).toStrictEqual(expected.caseInformation.categories);
    expect(transformed.caseInformation.callSummary).toBe('My summary');
    expect(transformed.contactlessTask).toStrictEqual({
      channel: 'web',
      createdOnBehalfOf: undefined,
      date: '',
      time: '',
    });
  });
});

const createContactWithMetadata = (
  { callType, childFirstName },
  contactlessTaskInfo = undefined,
): HrmServiceContactWithMetadata => {
  const blankForm = VALID_EMPTY_CONTACT.rawJson;
  const contactlessTask = contactlessTaskInfo || blankForm.contactlessTask;

  return {
    metadata: VALID_EMPTY_METADATA,
    contact: {
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
  };
};

const getFormFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).rawJson;
const getTimeOfContactFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).timeOfContact;
const getNumberFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).number;

describe('saveContact()', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: false, preEngagementData: { contactType: 'ip', contactIdentifier: 'ip-address' } },
  };
  const workerSid = 'worker-sid';
  const uniqueIdentifier = 'uniqueIdentifier';
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn(), text: jest.fn() });

  test('data calltype saves form data', async () => {
    const { contact, metadata } = createContactWithMetadata({ callType: callTypes.child, childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, contact, metadata, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data', async () => {
    const { contact, metadata } = createContactWithMetadata({ callType: 'hang up', childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, contact, metadata, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
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
  const workerSid = 'worker-sid';
  const uniqueIdentifier = 'uniqueIdentifier';
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn(), text: jest.fn() });
  let mockedFetch;

  beforeEach(() => {
    mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);
  });

  afterEach(() => {
    mockedFetch.mockClear();
  });

  test('data calltype saves form data', async () => {
    const { contact, metadata } = createContactWithMetadata(
      { callType: callTypes.child, childFirstName: 'Jill' },
      { channel: '', date: '2020-11-24', time: '12:00' },
    );
    await saveContact(task, contact, metadata, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).toISOString());
  });

  test('non-data calltype do not save form data (but captures contactlessTask info)', async () => {
    const contactlessTask = { channel: 'web', date: '2020-11-24', time: '12:00', createdOnBehalfOf: 'someone else' };
    const { contact, metadata } = createContactWithMetadata(
      { callType: 'hang up', childFirstName: 'Jill' },
      contactlessTask,
    );
    await saveContact({ ...task, taskSid: offlineContactTaskSid }, contact, metadata, workerSid, uniqueIdentifier);

    const expected = { ...contactlessTask };

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual('hang up');
    expect(formFromPOST.childInformation.firstName).toEqual('');
    expect(formFromPOST.contactlessTask).toStrictEqual(expected);
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).toISOString());
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
    const { contact, metadata } = createContactWithMetadata({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithIP, contact, metadata, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
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
    const { contact, metadata } = createContactWithMetadata({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(webTaskWithIP, contact, metadata, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
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
    const { contact, metadata } = createContactWithMetadata({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithoutIP, contact, metadata, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
    expect(numberFromPOST).toEqual('');
  });
});

describe('saveContact() (externalRecording)', () => {
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

    const { contact, metadata } = createContactWithMetadata({ callType: callTypes.child, childFirstName: 'Jill' });
    await saveContact(task, contact, metadata, 'workerSid', 'uniqueIdentifier');

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.conversationMedia).toStrictEqual([
      { store: 'twilio' },
      {
        store: 'S3',
        type: 'recording',
        location: {
          bucket: 'bucket',
          key: 'key',
        },
      },
    ]);
  });
});

describe('transformValues', () => {
  test('Strips entries in formValues that are not defined in provided form definition and adds undefined entries for form items without values', () => {
    const result = transformValues([
      { name: 'input1', type: FormInputType.Input, label: '' },
      { name: 'input2', type: FormInputType.Input, label: '' },
      { name: 'input3', type: FormInputType.Input, label: '' },
      { name: 'input4', type: FormInputType.Input, label: '' },
    ])({
      input1: 'something',
      input2: 'something else',
      input3: 'another thing',
      notInDef: 'delete me',
    });

    expect(result).toStrictEqual({
      input1: 'something',
      input2: 'something else',
      input3: 'another thing',
      input4: undefined,
    });
  });
  test("Converts 'mixed' values to nulls for mixed-checkbox types", () => {
    const result = transformValues([
      { name: 'mixed1', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'mixed2', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'mixed3', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'notMixed', type: FormInputType.Input, label: '' },
    ])({
      mixed1: 'mixed',
      mixed2: true,
      mixed3: false,
      notMixed: 'mixed',
    });

    expect(result).toStrictEqual({
      mixed1: null,
      mixed2: true,
      mixed3: false,
      notMixed: 'mixed',
    });
  });
});

// TODO: test category transformation
test('updateContactsFormInHrm - calls a PATCH HRM endpoint using the supplied contact ID in the route', async () => {
  const responseBody = { rawJson: { caseInformation: { categories: {} } } };
  const mockedFetch = jest.spyOn(global, 'fetch').mockResolvedValue(<Response>(<unknown>{
    ok: true,
    json: () => Promise.resolve(responseBody),
    text: () => Promise.resolve(responseBody),
  }));
  try {
    const inputPatch = { caseInformation: {}, categories: {} };
    const ret = await updateContactsFormInHrm('1234', inputPatch, helpline);
    expect(ret).toStrictEqual({ rawJson: inputPatch });
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts/1234'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          rawJson: {
            caseInformation: { categories: EMPTY_API_CATEGORIES },
            categories: {},
            definitionVersion: DefinitionVersionId.v1,
          },
        }),
      }),
    );
  } finally {
    mockedFetch.mockClear();
  }
});

describe('transformCategories', () => {
  let mockDef: DefinitionVersion;
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    const v1Defs = await loadDefinition(formDefinitionsBaseUrl);
    mockDef = {
      ...v1Defs,
      tabbedForms: {
        ...v1Defs.tabbedForms,
        IssueCategorizationTab: jest.fn(() => ({
          category1: {
            color: '',
            subcategories: [
              { label: 'subCategory1', toolkitUrl: '' },
              { label: 'subCategory2', toolkitUrl: '' },
            ],
          },
          category2: {
            color: '',
            subcategories: [
              { label: 'subCategory1', toolkitUrl: '' },
              { label: 'subCategory2', toolkitUrl: '' },
            ],
          },
        })),
      },
    };
  });

  test("Categories in input match the paths of those in definition - sets the subcategories found in defintions to 'true'", () => {
    const transformed = transformCategories(
      'a helpline',
      { category1: ['subCategory2'], category2: ['subCategory1'] },
      mockDef,
    );
    expect(transformed).toStrictEqual({
      category1: {
        subCategory1: false,
        subCategory2: true,
      },
      category2: {
        subCategory1: true,
        subCategory2: false,
      },
    });
    // Supplied helpline should be used to look up the categories
    expect(mockDef.tabbedForms.IssueCategorizationTab).toBeCalledWith('a helpline');
  });

  test("Empty array of categories - produces matrix of categories all set 'false'", () => {
    const transformed = transformCategories('a helpline', {}, mockDef);
    expect(transformed).toStrictEqual({
      category1: {
        subCategory1: false,
        subCategory2: false,
      },
      category2: {
        subCategory1: false,
        subCategory2: false,
      },
    });
  });

  test("Categories in input don't match the paths of those in definition - adds the missing paths to the output set to 'true'", () => {
    const transformed = transformCategories(
      'a helpline',
      { category3: ['subCategory2'], category2: ['subCategory1'] },
      mockDef,
    );
    expect(transformed).toStrictEqual({
      category1: {
        subCategory1: false,
        subCategory2: false,
      },
      category2: {
        subCategory1: true,
        subCategory2: false,
      },
      category3: {
        subCategory2: true,
      },
    });
  });

  test('Empty categories in input - adds empty category to output', () => {
    const transformed = transformCategories('a helpline', { category3: [] }, mockDef);
    expect(transformed).toStrictEqual({
      category1: {
        subCategory1: false,
        subCategory2: false,
      },
      category2: {
        subCategory1: false,
        subCategory2: false,
      },
      category3: {},
    });
  });
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
        { store: 'twilio', reservationSid: undefined },
        {
          store: 'S3',
          type: 'recording',
          location: {
            bucket: 'bucket',
            key: 'key',
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

    await expect(handleTwilioTask(task)).rejects.toThrow(
      'Error getting external recording info: Could not find call sid',
    );
  });
});
