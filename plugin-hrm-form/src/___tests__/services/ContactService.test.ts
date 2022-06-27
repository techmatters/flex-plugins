import { set } from 'lodash/fp';
import { callTypes, DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import {
  transformForm,
  saveContact,
  createCategoriesObject,
  transformContactFormValues,
  updateContactInHrm,
  transformCategories,
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
        channel: '',
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
    expect(transformed.callerInformation.name).toStrictEqual({ firstName: 'myFirstName', lastName: '' });
    expect(transformed.childInformation.gender).toBe('Male');
    expect(transformed.childInformation.name).toStrictEqual({ firstName: 'child', lastName: '' });
    expect(transformed.caseInformation.categories).toStrictEqual(expected.caseInformation.categories);
    expect(transformed.caseInformation.callSummary).toBe('My summary');
    expect(transformed.contactlessTask).toStrictEqual({
      channel: '',
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

const getFormFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).form;
const getTimeOfContactFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).timeOfContact;
const getNumberFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).number;

describe('saveContact()', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: false },
  };
  const workerSid = 'worker-sid';
  const uniqueIdentifier = 'uniqueIdentifier';
  const fetchSuccess = Promise.resolve(<any>{ ok: true });

  test('data calltype saves form data', async () => {
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, form, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.name.firstName).toEqual('Jill');

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data', async () => {
    const form = createForm({ callType: 'hang up', childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, form, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual('hang up');
    expect(formFromPOST.childInformation.name.firstName).toEqual('');

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
  const fetchSuccess = Promise.resolve(<any>{ ok: true });

  test('data calltype saves form data', async () => {
    const form = createForm(
      { callType: callTypes.child, childFirstName: 'Jill' },
      { channel: '', date: '2020-11-24', time: '12:00' },
    );
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(task, form, workerSid, uniqueIdentifier);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.name.firstName).toEqual('Jill');
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).getTime());

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data (but captures contactlessTask info)', async () => {
    const contactlessTask = { channel: 'web', date: '2020-11-24', time: '12:00', createdOnBehalfOf: 'someone else' };
    const form = createForm({ callType: 'hang up', childFirstName: 'Jill' }, contactlessTask);
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact({ ...task, taskSid: offlineContactTaskSid }, form, workerSid, uniqueIdentifier);

    const expected = { ...contactlessTask };

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual('hang up');
    expect(formFromPOST.childInformation.name.firstName).toEqual('');
    expect(formFromPOST.contactlessTask).toStrictEqual(expected);
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).getTime());

    mockedFetch.mockClear();
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
      },
    };
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(webTaskWithIP, form, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
    expect(numberFromPOST).toEqual(ip);

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

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveContact(webTaskWithoutIP, form, workerSid, uniqueIdentifier);

    const numberFromPOST = getNumberFromPOST(mockedFetch);
    expect(numberFromPOST).toEqual('');

    mockedFetch.mockClear();
  });
});

describe('transformContactFormValues', () => {
  test('Strips entries in formValues that are not defined in provided form definition and adds undefiend entries for form items without values', () => {
    const result = transformContactFormValues(
      {
        input1: 'something',
        input2: 'something else',
        input3: 'another thing',
        notInDef: 'delete me',
      },
      [
        { name: 'input1', type: 'input', label: '' },
        { name: 'input2', type: 'input', label: '' },
        { name: 'input3', type: 'input', label: '' },
        { name: 'input4', type: 'input', label: '' },
      ],
    );

    expect(result).toStrictEqual({
      name: {
        firstName: undefined,
        lastName: undefined,
      },
      input1: 'something',
      input2: 'something else',
      input3: 'another thing',
      input4: undefined,
    });
  });
  test("Creates a 'name' subobject and populates 'firstName' and 'lastName' properties from top level of input object", () => {
    const result = transformContactFormValues(
      {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
      },
      [
        { name: 'firstName', type: 'input', label: '' },
        { name: 'lastName', type: 'input', label: '' },
      ],
    );

    expect(result).toStrictEqual({
      name: {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
      },
    });
  });
  test("Converts 'mixed' values to nulls for mixed-checkbox types", () => {
    const result = transformContactFormValues(
      {
        mixed1: 'mixed',
        mixed2: true,
        mixed3: false,
        notMixed: 'mixed',
      },
      [
        { name: 'mixed1', type: 'mixed-checkbox', label: '' },
        { name: 'mixed2', type: 'mixed-checkbox', label: '' },
        { name: 'mixed3', type: 'mixed-checkbox', label: '' },
        { name: 'notMixed', type: 'input', label: '' },
      ],
    );

    expect(result).toStrictEqual({
      name: {
        firstName: undefined,
        lastName: undefined,
      },
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
      '/contacts/1234',
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
            subcategories: ['subCategory1', 'subCategory2'],
          },
          category2: {
            color: '',
            subcategories: ['subCategory1', 'subCategory2'],
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
