import { transformForm, saveToHrm } from '../../services/ContactService';
import { FieldType, ValidationType, recreateBlankForm } from '../../states/ContactFormStateFactory';
import callTypes, { channelTypes } from '../../states/DomainConstants';

describe('transformForm', () => {
  test('removes control information and presents values only', () => {
    const oldForm = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        type: FieldType.TAB,
        name: {
          type: FieldType.INTERMEDIATE,
          firstName: {
            type: FieldType.TEXT_INPUT,
            value: 'myFirstName',
            touched: true,
            error: null,
            validation: null,
          },
        },
      },
      childInformation: {
        type: FieldType.TAB,
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          touched: true,
          value: 'Male',
        },
        refugee: {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ValidationType.REQUIRED],
          error: null,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: true,
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
        status: {
          value: '',
          type: FieldType.SELECT_SINGLE,
          validation: null,
        },
        callSummary: {
          type: FieldType.TEXT_BOX,
          validation: null,
          value: 'My summary',
        },
      },
      contactlessTask: {
        channel: '',
        date: '',
        time: '',
      },
    };
    const expected = {
      callType: callTypes.caller,
      callerInformation: {
        name: {
          firstName: 'myFirstName',
        },
      },
      childInformation: {
        gender: 'Male',
        refugee: false,
      },
      caseInformation: {
        categories: {
          category1: {
            sub1: true,
            sub2: false,
          },
        },
        status: '',
        callSummary: 'My summary',
      },
      contactlessTask: {
        channel: '',
        date: '',
        time: '',
      },
    };
    expect(transformForm(oldForm)).toStrictEqual(expected);
  });
});

const createForm = ({ callType, childFirstName }) => {
  const blankForm = recreateBlankForm();

  return {
    ...blankForm,
    callType: {
      type: FieldType.CALL_TYPE,
      value: callType,
    },
    childInformation: {
      ...blankForm.childInformation,
      name: {
        ...blankForm.childInformation.name,
        firstName: {
          type: FieldType.TEXT_INPUT,
          value: childFirstName,
          touched: true,
          error: null,
          validation: null,
        },
      },
    },
  };
};

const getFormFromPOST = mockedFetch => JSON.parse(mockedFetch.mock.calls[0][1].body).form;

describe('saveToHrm()', () => {
  const task = {
    queueName: 'queueName',
    channelType: channelTypes.web,
    defaultFrom: 'Anonymous',
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
