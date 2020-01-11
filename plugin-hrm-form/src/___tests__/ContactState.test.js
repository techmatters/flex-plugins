import { HANDLE_BLUR,
         HANDLE_FOCUS
        } from '../states/ActionTypes';
import { editNestedField, reduce } from '../states/ContactState';

describe('editedNestedField', () => {
  const original = {      
    callType: '',
    internal: {
      tab: 0
    },
    callerInformation: {
      name: {
        firstName: {
          value: '',
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

  test('edits a normal nested field', () => {
    const expected = {      
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: false,
            error: null
          },
          lastName: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: 'aNewLastName'
        }
      }
    };
    expect(editNestedField(original, ['childInformation', 'name'], 'lastName', 'aNewLastName'))
      .toStrictEqual(expected);
  });

  test('edits callerInformation firstName all special like', () => {
    const expected = {      
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: 'aNewFirstName',
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
    expect(editNestedField(original, ['callerInformation', 'name'], 'firstName', 'aNewFirstName'))
      .toStrictEqual(expected);
  })
});

describe('reduce', () => {
  test('HANDLE_BLUR updates the whole form', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: true,
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
        }
      }
    };
    const form = {
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: true,
            error: 'This field is required'
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
    const action = {
      type: HANDLE_BLUR,
      form,
      taskId: 'WT1234'
    };
    expect(reduce(initialState, action)).toStrictEqual({
      tasks: {
        WT1234: form
      }
    });
  });

  test('HANDLE_FOCUS updates touched', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
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
        }
      }
    };
    const action = {
      type: HANDLE_FOCUS,
      parents: ['callerInformation', 'name'],
      name: 'firstName',
      taskId: 'WT1234'
    };
    const expected = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: true,
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
        }
      }
    };
    expect(reduce(initialState, action)).toStrictEqual(expected);
  });
})