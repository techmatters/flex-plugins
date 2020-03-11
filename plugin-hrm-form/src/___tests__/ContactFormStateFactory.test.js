import _ from 'lodash';

import { FieldType, generateInitialFormState, ValidationType } from '../states/ContactFormStateFactory';

test('generateInitialFormState operates as expected', () => {
  const testFormDefinition = {
    callType: {
      type: FieldType.CALL_TYPE,
    },
    callerInformation: {
      type: FieldType.TAB,
      name: {
        type: FieldType.INTERMEDIATE,
        firstName: {
          type: FieldType.TEXT_INPUT,
          validation: [ValidationType.REQUIRED],
        },
        lastName: {
          type: FieldType.TEXT_INPUT,
          validation: null,
        },
      },
      relationshipToChild: {
        type: FieldType.SELECT_SINGLE,
        validation: null,
      },
      gender: {
        type: FieldType.SELECT_SINGLE,
        validation: [ValidationType.REQUIRED],
      },
    },
    caseInformation: {
      type: FieldType.TAB,
      categories: {
        type: FieldType.CHECKBOX_FIELD,
        validation: [ValidationType.REQUIRED],
        category1: {
          type: FieldType.INTERMEDIATE,
          sub1: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub2: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub3: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub4: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub5: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub6: {
            type: FieldType.CHECKBOX,
            value: false,
          },
        },
        category2: {
          type: FieldType.INTERMEDIATE,
          sub1: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub2: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub3: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub4: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub5: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub6: {
            type: FieldType.CHECKBOX,
            value: false,
          },
        },
      },
      status: {
        value: 'In Progress',
        type: FieldType.SELECT_SINGLE,
        validation: null,
      },
      keepConfidential: {
        type: FieldType.CHECKBOX,
        value: true,
      },
      okForCaseWorkerToCall: {
        type: FieldType.CHECKBOX,
        value: false,
      },
    },
  };

  const expected = {
    callType: {
      type: FieldType.CALL_TYPE,
      value: '',
    },
    callerInformation: {
      type: FieldType.TAB,
      name: {
        type: FieldType.INTERMEDIATE,
        firstName: {
          type: FieldType.TEXT_INPUT,
          validation: [ValidationType.REQUIRED],
          value: '',
          error: null,
          touched: false,
        },
        lastName: {
          type: FieldType.TEXT_INPUT,
          validation: null,
          value: '',
          error: null,
          touched: false,
        },
      },
      relationshipToChild: {
        type: FieldType.SELECT_SINGLE,
        validation: null,
        value: '',
        error: null,
        touched: false,
      },
      gender: {
        type: FieldType.SELECT_SINGLE,
        validation: [ValidationType.REQUIRED],
        value: '',
        error: null,
        touched: false,
      },
    },
    caseInformation: {
      type: FieldType.TAB,
      categories: {
        type: FieldType.CHECKBOX_FIELD,
        validation: [ValidationType.REQUIRED],
        touched: false,
        error: null,
        category1: {
          type: FieldType.INTERMEDIATE,
          sub1: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub2: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub3: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub4: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub5: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub6: {
            type: FieldType.CHECKBOX,
            value: false,
          },
        },
        category2: {
          type: FieldType.INTERMEDIATE,
          sub1: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub2: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub3: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub4: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub5: {
            type: FieldType.CHECKBOX,
            value: false,
          },
          sub6: {
            type: FieldType.CHECKBOX,
            value: false,
          },
        },
      },
      status: {
        type: FieldType.SELECT_SINGLE,
        validation: null,
        error: null,
        touched: false,
        value: 'In Progress',
      },
      keepConfidential: {
        type: FieldType.CHECKBOX,
        value: true,
      },
      okForCaseWorkerToCall: {
        type: FieldType.CHECKBOX,
        value: false,
      },
    },
  };

  /*
   * const { metadata, ...rest } = testFormDefinition;
   * expect(generateInitialFormState(testFormDefinition)).toStrictEqual(expected);
   */
  const generatedForm = generateInitialFormState(testFormDefinition);
  const testForm = _.omit(generatedForm, 'metadata');
  expect(testForm).toStrictEqual(expected);
});
