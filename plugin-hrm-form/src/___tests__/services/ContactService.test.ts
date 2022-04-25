import { set } from 'lodash/fp';
import { callTypes, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import { transformForm, saveContact, createCategoriesObject } from '../../services/ContactService';
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
