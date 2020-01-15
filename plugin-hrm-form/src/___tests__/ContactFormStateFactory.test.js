import { FieldType,
         generateInitialFormState,
         ValidationType } from '../states/ContactFormStateFactory';

test('generateInitialFormState operates as expected', () => {
  const expected = {
    callType: {
      type: FieldType.CALL_TYPE,
      value: ''
    },
    callerInformation: {
      type: FieldType.TAB,
      name: {
        type: FieldType.INTERMEDIATE,
        firstName: {
          type: FieldType.TEXT_INPUT,
          validation: [ ValidationType.REQUIRED ],
          value: '',
          error: null,
          touched: false
        },
        lastName: {
          type: FieldType.TEXT_INPUT,
          validation: null,
          value: '',
          error: null,
          touched: false
        }
      },
      relationshipToChild: {
        type: FieldType.SELECT_SINGLE,
        validation: null,
        value: '',
        error: null,
        touched: false
      },
      gender: {
        type: FieldType.SELECT_SINGLE,
        validation: [ ValidationType.REQUIRED ],
        value: '',
        error: null,
        touched: false
      },
      age: {
        type: FieldType.SELECT_SINGLE,
        validation: [ ValidationType.REQUIRED ],
        value: '',
        error: null,
        touched: false
      }
    },
    caseInformation: {
      type: FieldType.TAB,
      categories: {
        type: FieldType.CHECKBOX_FIELD,
        validation: [ ValidationType.REQUIRED ],
        error: null,
        category1: {
          sub1: false,
          sub2: false,
          sub3: false,
          sub4: false,
          sub5: false,
          sub6: false,
        },
        category2: {
          sub1: false,
          sub2: false,
          sub3: false,
          sub4: false,
          sub5: false,
          sub6: false,
        }
      },
      keepConfidential: {
        type: FieldType.CHECKBOX,
        value: true
      },
      okForCaseWorkerToCall: {
        type: FieldType.CHECKBOX,
        value: false
      }
    }
  };
  expect(generateInitialFormState()).toStrictEqual(expected);
});