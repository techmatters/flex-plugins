import { omit } from 'lodash';

import { FieldType, createBlankForm, ValidationType } from '../../states/ContactFormStateFactory';

test('createBlankForm operates as expected', () => {
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
          color: '#ff0000',
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
          color: '#00ff00',
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
          color: '#ff0000',
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
          color: '#00ff00',
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

  // we omit metadata because we can't know the exact time of form creation (metadata.startMillis)
  const generatedForm = createBlankForm(testFormDefinition);
  const testForm = omit(generatedForm, 'metadata');
  expect(testForm).toStrictEqual(expected);
  expect(generatedForm.metadata).toEqual(
    expect.objectContaining({
      startMillis: expect.any(Number),
      endMillis: null,
      recreated: false,
    }),
  );
});
