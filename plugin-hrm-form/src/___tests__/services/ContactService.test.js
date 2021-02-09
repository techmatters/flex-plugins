import { set } from 'lodash/fp';

import '../mockGetConfig';

import { transformForm, saveToHrm, createCategoriesObject } from '../../services/ContactService';
import { createNewTaskEntry } from '../../states/contacts/reducer';
import callTypes, { channelTypes } from '../../states/DomainConstants';
import callerFormDefinition from '../../formDefinitions/v1/tabbedForms/CallerInformationTab.json';
import caseInfoFormDefinition from '../../formDefinitions/v1/tabbedForms/CaseInformationTab.json';
import childFormDefinition from '../../formDefinitions/v1/tabbedForms/ChildInformationTab.json';
import categoriesFormDefinition from '../../formDefinitions/v1/tabbedForms/IssueCategorizationTab.json';

describe('transformForm', () => {
  test('removes control information and presents values only', () => {
    const oldForm = {
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
      metadata: {},
    };

    const expectedCategories = oldForm.categories.reduce((acc, path) => set(path, true, acc), {
      categories: createCategoriesObject(),
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

    oldForm.categories.reduce((acc, path) => set(path, true, acc));

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

// The tabbed form definitions, used to create new form state.
const definitions = {
  callerFormDefinition,
  caseInfoFormDefinition,
  categoriesFormDefinition,
  childFormDefinition,
};

const createForm = ({ callType, childFirstName }, contactlessTaskInfo = undefined) => {
  const blankForm = createNewTaskEntry(definitions)(false);
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

describe('saveToHrm()', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: false },
  };
  const hrmBaseUrl = 'hrmBaseUrl';
  const workerSid = 'worker-sid';
  const helpline = 'helpline';
  const fetchSuccess = Promise.resolve({
    ok: true,
    json: () => Promise.resolve(),
  });

  test('data calltype saves form data', async () => {
    const form = createForm({ callType: callTypes.child, childFirstName: 'Jill' });

    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.name.firstName).toEqual('Jill');

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data', async () => {
    const form = createForm({ callType: callTypes.hangup, childFirstName: 'Jill' });
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.hangup);
    expect(formFromPOST.childInformation.name.firstName).toEqual('');

    mockedFetch.mockClear();
  });
});

describe('saveToHrm() (isContactlessTask)', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
    attributes: { isContactlessTask: true },
  };
  const hrmBaseUrl = 'hrmBaseUrl';
  const workerSid = 'worker-sid';
  const helpline = 'helpline';
  const fetchSuccess = Promise.resolve({
    ok: true,
    json: () => Promise.resolve(),
  });

  test('data calltype saves form data', async () => {
    const form = createForm(
      { callType: callTypes.child, childFirstName: 'Jill' },
      { channel: '', date: '2020-11-24', time: '12:00' },
    );
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.child);
    expect(formFromPOST.childInformation.name.firstName).toEqual('Jill');
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).getTime());

    mockedFetch.mockClear();
  });

  test('non-data calltype do not save form data (but captures contactlessTask info)', async () => {
    const contactlessTask = { channel: 'web', date: '2020-11-24', time: '12:00' };
    const form = createForm({ callType: callTypes.hangup, childFirstName: 'Jill' }, contactlessTask);
    const mockedFetch = jest.spyOn(global, 'fetch').mockImplementation(() => fetchSuccess);

    await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);

    const formFromPOST = getFormFromPOST(mockedFetch);
    expect(formFromPOST.callType).toEqual(callTypes.hangup);
    expect(formFromPOST.childInformation.name.firstName).toEqual('');
    expect(formFromPOST.contactlessTask).toStrictEqual(contactlessTask);
    expect(getTimeOfContactFromPOST(mockedFetch)).toEqual(new Date(2020, 10, 24, 12, 0).getTime());

    mockedFetch.mockClear();
  });
});
