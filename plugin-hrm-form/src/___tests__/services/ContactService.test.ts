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

import { set } from 'lodash/fp';
import { callTypes, DefinitionVersion, DefinitionVersionId, FormInputType, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import {
  createCategoriesObject,
  saveContact,
  transformCategories,
  transformForm,
  transformValues,
  updateContactInHrm,
} from '../../services/ContactService';
import { createNewTaskEntry, TaskEntry } from '../../states/contacts/reducer';
import { channelTypes } from '../../states/DomainConstants';
import { offlineContactTaskSid } from '../../types/types';
import { getDefinitionVersions } from '../../HrmFormPlugin';

const helpline = 'ChildLine Zambia (ZM)';

// eslint-disable-next-line no-empty-function
global.fetch = global.fetch ? global.fetch : () => Promise.resolve(<any>{ ok: true });

jest.mock('../../services/formSubmissionHelpers', () => ({
  getHelplineToSave: () => ({
    helpline: Promise.resolve(helpline),
  }),
}));

jest.mock('@twilio/flex-ui', () => ({
  __esModule: true,
  ...(<any>jest.requireActual('@twilio/flex-ui')),
  TaskHelper: {
    isChatBasedTask: () => true,
  },
}));

let mockV1;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

describe('transformForm', () => {
  test('removes control information and presents values only', () => {
    const oldForm: TaskEntry = {
      helpline,
      isCallTypeCaller: true,
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
      categories: ['categories.Abuse.Abduction'],
      caseInformation: {
        callSummary: 'My summary',
      },
      contactlessTask: {
        channel: channelTypes.web,
        date: '',
        time: '',
      },
      csamReports: [],
      metadata: <any>{},
    };

    const expectedCategories = oldForm.categories.reduce((acc, path) => set(path, true, acc), {
      categories: createCategoriesObject(mockV1.tabbedForms.IssueCategorizationTab(helpline)),
    }).categories;

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
        categories: expectedCategories,
        callSummary: 'My summary',
      },
      contactlessTask: {
        channel: '',
        date: '',
        time: '',
      },
      metadata: {},
    };

    const transformed = transformForm(oldForm);
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
      date: '',
      time: '',
    });
  });
});

const createForm = ({ callType, childFirstName }, contactlessTaskInfo = undefined) => {
  const blankForm = createNewTaskEntry(mockV1)(false);
  const contactlessTask = contactlessTaskInfo || blankForm.contactlessTask;

  return {
    ...blankForm,
    callType,
    childInformation: {
      ...blankForm.childInformation,
      firstName: childFirstName,
    },
    contactlessTask,
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
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn() });

  test('data calltype saves form data', async () => {
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, form, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data', async () => {
    const form = createForm({ callType: 'hang up', childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, form, workerSid, uniqueIdentifier);

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
  const fetchSuccess = Promise.resolve(<any>{ ok: true, json: jest.fn() });
  let mockedFetch;

  beforeEach(() => {
    mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);
  });

  afterEach(() => {
    mockedFetch.mockClear();
  });

  test('data calltype saves form data', async () => {
    const form = createForm(
      { callType: callTypes.child, childFirstName: 'Jill' },
      { channel: '', date: '2020-11-24', time: '12:00' },
    );
    await saveContact(task, form, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.firstName).toEqual('Jill');
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).toISOString());
  });

  test('non-data calltype do not save form data (but captures contactlessTask info)', async () => {
    const contactlessTask = { channel: 'web', date: '2020-11-24', time: '12:00', createdOnBehalfOf: 'someone else' };
    const form = createForm({ callType: 'hang up', childFirstName: 'Jill' }, contactlessTask);
    await saveContact({ ...task, taskSid: offlineContactTaskSid }, form, workerSid, uniqueIdentifier);

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
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithIP, form, workerSid, uniqueIdentifier);

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
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(webTaskWithIP, form, workerSid, uniqueIdentifier);

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
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    await saveContact(webTaskWithoutIP, form, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
    expect(numberFromPOST).toEqual('');
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

test('updateContactInHrm - calls a PATCH HRM endpoint using the supplied contact ID in the route', async () => {
  const responseBody = { from: 'HRM' };
  const mockedFetch = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(<Response>{ ok: true, json: () => Promise.resolve(responseBody) });
  try {
    const inputPatch = { rawJson: { caseInformation: { categories: {} } } };
    const ret = await updateContactInHrm('1234', inputPatch);
    expect(ret).toStrictEqual(responseBody);
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

describe('transformCategories', () => {
  let mockDef: DefinitionVersion;
  beforeAll(async () => {
    const v1Defs = await loadDefinition(DefinitionVersionId.v1);
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
      ['categories.category1.subCategory2', 'categories.category2.subCategory1'],
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
    const transformed = transformCategories('a helpline', [], mockDef);
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
      ['categories.category3.subCategory2', 'categories.category2.subCategory1'],
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

  test("Categories in input has paths with something other than 2 sections - adds the paths anyway to the output set to 'true'", () => {
    const transformed = transformCategories(
      'a helpline',
      ['categories.category2', 'categories.category1.subCategory1.subSubCategory'],
      mockDef,
    );
    /*
     * Stuff gets weird, subCategory1 was a boolean, but it now has a sub property so got converted to a 'Boolean' wrapper type.
     * Probably best to avoid this scenario :-P
     */
    // eslint-disable-next-line no-new-wrappers
    const subCategory1 = new Boolean();
    (<any>subCategory1).subSubCategory = true;
    expect(transformed).toStrictEqual({
      category1: {
        subCategory1,
        subCategory2: false,
      },
      category2: true,
    });
  });
});
