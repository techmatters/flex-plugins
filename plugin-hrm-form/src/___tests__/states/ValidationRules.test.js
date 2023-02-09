/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import '../mockGetConfig';
import { callTypes } from 'hrm-form-definitions';

import { formIsValid, validateOnBlur, validateBeforeSubmit } from '../../states/validationRules';
import { FieldType, ValidationType } from '../../states/ContactFormStateFactory';

describe('validateOnBlur', () => {
  test('does not generate an error when field is not touched', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: '',
          touched: false,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    const received = validateOnBlur(form);
    expect(received).toStrictEqual(form);
  });

  test('does not generate an error when field has a value', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: 'testValue',
          touched: true,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    const received = validateOnBlur(form);
    expect(received).toStrictEqual(form);
  });

  test('does generate an error when field is touched and has no value', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: '',
          touched: true,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    const expected = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: '',
          touched: true,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  });

  test('removes the error when field gets a value', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: 'testValue',
          touched: true,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    const expected = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.child,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: 'testValue',
          touched: true,
          error: null,
        },
      },
      caseInformation: {
        // stub for test
      },
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  });

  test('generates error for CHECKBOX_FIELD type when no boxes checked', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        // stub for test
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ValidationType.REQUIRED],
          error: null,
          touched: true,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
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
          },
        },
      },
    };
    const expected = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        // stub for test
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ValidationType.REQUIRED],
          error: null,
          touched: true,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
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
          },
        },
      },
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  });

  test('does not generate error for CHECKBOX_FIELD type when not yet touched', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        // stub for test
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ValidationType.REQUIRED],
          error: null,
          touched: false,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
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
          },
        },
      },
    };
    const received = validateOnBlur(form);
    expect(received).toStrictEqual(form);
  });

  test('removes error for CHECKBOX_FIELD type when boxes checked', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        // stub for test
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
          },
          category2: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
      },
    };
    const expected = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        // stub for test
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
          },
          category2: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
      },
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  });
});

describe('formIsValid', () => {
  test('returns true if callType is standalone', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.hangup,
      },
      callerInformation: {
        type: FieldType.TAB,
        name: {
          type: FieldType.INTERMEDIATE,
          firstName: {
            type: FieldType.TEXT_INPUT,
            validation: [ValidationType.REQUIRED],
            value: '',
            touched: true,
            error: 'This is a big bad error',
          },
        },
      },
    };
    expect(formIsValid(form)).toBe(true);
  });

  test('returns true if no errors present', () => {
    const form = {
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
            validation: [ValidationType.REQUIRED],
            value: 'myValue',
            touched: true,
            error: null,
          },
        },
      },
    };
    expect(formIsValid(form)).toBe(true);
  });

  test('returns false if an error is present', () => {
    const form = {
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
            validation: [ValidationType.REQUIRED],
            value: '',
            touched: true,
            error: 'This field is required',
          },
        },
      },
    };
    expect(formIsValid(form)).toBe(true);
  });
});

describe('validateBeforeSubmit', () => {
  test('validates fields even if not touched', () => {
    const form = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: '',
          touched: false,
          error: null,
        },
      },
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: [ValidationType.REQUIRED],
          error: null,
          touched: false,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
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
          },
        },
      },
    };
    const expected = {
      callType: {
        type: FieldType.CALL_TYPE,
        value: callTypes.caller,
      },
      callerInformation: {
        // stub for test
      },
      childInformation: {
        gender: {
          type: FieldType.SELECT_SINGLE,
          validation: [ValidationType.REQUIRED],
          value: '',
          touched: false,
          error: null,
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
          },
          category2: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
      },
    };
    expect(validateBeforeSubmit(form)).toStrictEqual(expected);
  });
});
