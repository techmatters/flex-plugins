import { formIsValid, validateOnBlur } from '../states/ValidationRules';

describe('validateOnBlur', () => {
  test('does not generate an error when field is not touched', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: false,
            error: null
          }
        }
      }
    };
    const received = validateOnBlur(form);
    expect(received).toStrictEqual(form);
    expect(received).not.toBe(form);
  });

  test('does not generate an error when field has a value', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: 'testValue',
            touched: true,
            error: null
          }
        }
      }
    };
    const received = validateOnBlur(form);
    expect(received).toStrictEqual(form);
    expect(received).not.toBe(form);
  })

  test('does generate an error when field is touched and has no value', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: true,
            error: null
          }
        }
      }
    };
    const expected = {
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: true,
            error: 'This field is required'
          }
        }
      }
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  })

  test('removes the error when field gets a value', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: 'myValue',
            touched: true,
            error: 'This field is required'
          }
        }
      }
    };
    const expected = {
      callerInformation: {
        name: {
          firstName: {
            value: 'myValue',
            touched: true,
            error: null
          }
        }
      }
    };
    expect(validateOnBlur(form)).toStrictEqual(expected);
  })
});

describe('formIsValid', () => {
  test('returns true if no errors present', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: 'myValue',
            touched: true,
            error: null
          }
        }
      }
    };
    expect(formIsValid(form)).toBe(true);
  });

  test('returns false if an error is present', () => {
    const form = {
      callerInformation: {
        name: {
          firstName: {
            value: 'myValue',
            touched: true,
            error: 'This field is required'
          }
        }
      }
    };
    expect(formIsValid(form)).toBe(false);
  });
})