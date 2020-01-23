import { transformForm } from '../components/HrmFormController';
import { FieldType, ValidationType } from '../states/ContactFormStateFactory';
import { callTypes } from '../states/DomainConstants';

describe('transformForm', () => {
  test('removes control information and presents values only', () => {
    const oldForm = {      
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller
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
            validation: null
          }
        }
      },
      childInformation: {
        type: FieldType.TAB,
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ ValidationType.REQUIRED ],
          touched: true,
          value: 'Male'
        },
        refugee: {
          type: FieldType.CHECKBOX,
          value: false
        }
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ ValidationType.REQUIRED ],
          error: null,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: true
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: false
            }
          }
        },
        status: {
          value: '',
          type: FieldType.SELECT_SINGLE,
          validation: null
        },
        callSummary: {
          type: FieldType.TEXT_BOX,
          validation: null,
          value: 'My summary'
        }
      }
    };
    const expected = {      
      callType: callTypes.caller,
      callerInformation: {
        name: {
          firstName: 'myFirstName'
        }
      },
      childInformation: {
        gender: 'Male',
        refugee: false
      },
      caseInformation: {
        categories: {
          category1: {
            sub1: true,
            sub2: false
          }
        },
        status: '',
        callSummary: 'My summary'
      }
    };
    expect(transformForm(oldForm)).toStrictEqual(expected);
  })
});
