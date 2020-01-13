import { formIsValid, validateOnBlur, validateBeforeSubmit } from '../states/ValidationRules';
import { callTypes } from '../states/DomainConstants';

describe('validateOnBlur', () => {
  test('does not generate an error when field is not touched', () => {
    const form = {
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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
      callType: callTypes.caller,
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

describe('validateBeforeSubmit', () => {
  test('only validate if callType is caller', () => {
    Object.keys(callTypes)
      .filter(type => (type !== callTypes.caller))
      .forEach(type => {
        const form = {
          callType: callTypes.child,
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
        expect(validateBeforeSubmit(form)).toStrictEqual(form);
      });
  });

  test('validates empty field even if not touched', () => {
    const form = {
      callType: callTypes.caller,
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
    const expected = {
      callType: callTypes.caller,
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
    expect(validateBeforeSubmit(form)).toStrictEqual(expected);
  });
});