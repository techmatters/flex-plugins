import { FieldType,
         generateInitialFormState,
         ValidationType } from '../states/ContactFormStateFactory';

test('generateInitialFormState operates as expected', () => {
  const testFormDefinition = {
    callType: {
      type: FieldType.CALL_TYPE
    },
    callerInformation: {
      type: FieldType.TAB,
      name: {
        type: FieldType.INTERMEDIATE,
        firstName: {
          type: FieldType.TEXT_INPUT,
          validation: [ ValidationType.REQUIRED ]
        },
        lastName: {
          type: FieldType.TEXT_INPUT,
          validation: null
        }
      },
      relationshipToChild: {
        type: FieldType.SELECT_SINGLE,
        validation: null
      },
      gender: {
        type: FieldType.SELECT_SINGLE,
        validation: [ ValidationType.REQUIRED ]
      }
    },
    caseInformation: {
      type: FieldType.TAB,
      categories: {
        type: FieldType.CHECKBOX_FIELD,
        validation: [ ValidationType.REQUIRED ],
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
      status:  {
        value: 'In Progress',
        type: FieldType.SELECT_SINGLE,
        validation: null
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
      status: {
        type: FieldType.SELECT_SINGLE,
        validation: null,
        error: null,
        touched: false,
        value: 'In Progress'
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
  expect(generateInitialFormState(testFormDefinition)).toStrictEqual(expected);
});