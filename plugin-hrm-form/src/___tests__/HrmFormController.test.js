import { transformForm } from '../components/HrmFormController';

describe('transformForm', () => {
  test('deepcopies form, makes firstName object with single value, and removes internal', () => {
    const oldForm = {      
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: 'myFirstName',
            touched: false,
            error: null
          },
          lastName: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: ''
        }
      }
    };
    const expected = {      
      callType: '',
      callerInformation: {
        name: {
          firstName: 'myFirstName',
          lastName: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: ''
        }
      }
    };
    const received = transformForm(oldForm);
    expect(received).toStrictEqual(expected);
    expect(received).not.toBe(oldForm);
    expect(received.childInformation).not.toBe(oldForm.childInformation);
  })
});
