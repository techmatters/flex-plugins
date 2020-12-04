import { omit } from 'lodash';

import {
  HANDLE_BLUR,
  HANDLE_FOCUS,
  SAVE_END_MILLIS,
  PREPOPULATE_FORM_CHILD,
  PREPOPULATE_FORM_CALLER,
} from '../../states/ActionTypes';
import { recreateContactState } from '../../states/actions';
import { reduce, handleSelectSearchResult } from '../../states/ContactState';
import { createBlankForm } from '../../states/ContactFormStateFactory';
import callTypes from '../../states/DomainConstants';

describe('reduce', () => {
  test('HANDLE_BLUR updates the whole form', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0,
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: true,
                error: null,
              },
              lastName: '',
            },
          },
          childInformation: {
            name: {
              firstName: '',
              lastName: '',
            },
          },
        },
      },
    };
    const form = {
      callType: '',
      internal: {
        tab: 0,
      },
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: true,
            error: 'This field is required',
          },
          lastName: '',
        },
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: '',
        },
      },
    };
    const action = {
      type: HANDLE_BLUR,
      form,
      taskId: 'WT1234',
    };
    expect(reduce(initialState, action)).toStrictEqual({
      tasks: {
        WT1234: form,
      },
    });
  });

  test('HANDLE_FOCUS updates touched', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0,
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: false,
                error: null,
              },
              lastName: '',
            },
          },
          childInformation: {
            name: {
              firstName: '',
              lastName: '',
            },
          },
        },
      },
    };
    const action = {
      type: HANDLE_FOCUS,
      parents: ['callerInformation', 'name'],
      name: 'firstName',
      taskId: 'WT1234',
    };
    const expected = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0,
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: true,
                error: null,
              },
              lastName: '',
            },
          },
          childInformation: {
            name: {
              firstName: '',
              lastName: '',
            },
          },
        },
      },
    };
    expect(reduce(initialState, action)).toStrictEqual(expected);
  });

  test('SAVE_END_MILIS works fine with a defined form', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0,
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: false,
                error: null,
              },
              lastName: '',
            },
          },
          childInformation: {
            name: {
              firstName: '',
              lastName: '',
            },
          },
          metadata: {
            recreated: false,
            startMillis: new Date().getTime(),
            endMillis: null,
          },
        },
      },
    };

    const action = {
      type: SAVE_END_MILLIS,
      taskId: 'WT1234',
    };

    const expected = {
      tasks: {
        WT1234: {
          callType: '',
          internal: {
            tab: 0,
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: false,
                error: null,
              },
              lastName: '',
            },
          },
          childInformation: {
            name: {
              firstName: '',
              lastName: '',
            },
          },
        },
      },
    };

    // omit metadata because we can't know the exact time of form creation (metadata.startMillis)
    const result = reduce(initialState, action);
    const { WT1234 } = result.tasks;
    const testTask = omit(WT1234, 'metadata');
    const testState = { tasks: { ...result.tasks, WT1234: testTask } };
    expect(testState).toStrictEqual(expected);
    expect(WT1234.metadata).toEqual(
      expect.objectContaining({
        startMillis: expect.any(Number),
        endMillis: expect.any(Number),
        recreated: false,
      }),
    );
  });

  test('SAVE_END_MILIS works fine with undefined form', () => {
    const initialState = {
      tasks: {},
    };

    const action = {
      type: SAVE_END_MILLIS,
      taskId: 'WT1234',
    };

    /*
     * omit metadata because we can't know the exact time of form creation (metadata.startMillis)
     * the whole form is not tested for strict equality
     * as it will have "defaultDefinition" (because is recreated)
     */
    const result = reduce(initialState, action);
    const { WT1234 } = result.tasks;
    expect(WT1234.metadata).toEqual(
      expect.objectContaining({
        startMillis: null,
        endMillis: expect.any(Number),
        recreated: true,
      }),
    );
  });

  let state;
  test('RECREATE_CONTACT_STATE works fine with undefined form', () => {
    const initialState = {
      tasks: {},
    };

    const action = recreateContactState({})('WT1234');

    const result = reduce(initialState, action);
    const { WT1234 } = result.tasks;

    expect(omit(WT1234, 'metadata')).toStrictEqual(omit(createBlankForm(), 'metadata'));
    expect(WT1234.metadata.startMillis).toBeNull();
    expect(WT1234.metadata.recreated).toBeTruthy();

    state = result;
  });

  test('RECREATE_CONTACT_STATE does nothing with existing form', () => {
    expect(state.tasks.WT1234.callerInformation.name.firstName.touched).toBeFalsy();

    const result1 = reduce(state, {
      type: HANDLE_FOCUS,
      parents: ['callerInformation', 'name'],
      name: 'firstName',
      taskId: 'WT1234',
    });

    expect(result1.tasks.WT1234.callerInformation.name.firstName.touched).toBeTruthy();

    const action = recreateContactState({})('WT1234');
    const result2 = reduce(result1, action);
    const { WT1234 } = result2.tasks;

    // if this remains truthy after recreateContactState, the form was not touched by the action
    expect(WT1234.callerInformation.name.firstName.touched).toBeTruthy();
  });

  test('PREPOPULATE_FORM_CHILD alters only the fields it should', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: {
            value: 'Child calling about self',
          },
          callerInformation: {
            name: '',
          },
          childInformation: {
            name: {
              firstName: {
                value: '',
                touched: false,
                error: null,
              },
              lastName: '',
            },
            gender: {
              value: '',
              touched: false,
              error: null,
            },
            age: {
              value: '',
              touched: false,
              error: null,
            },
          },
        },
        WT5678: {
          callType: {
            value: 'Someone calling about a child',
          },
        },
      },
    };

    const action = {
      type: PREPOPULATE_FORM_CHILD,
      gender: 'Boy',
      age: 'Unknown',
      taskId: 'WT1234',
    };

    const expectedTasks = {
      WT1234: {
        callType: {
          value: 'Child calling about self',
        },
        callerInformation: {
          name: '',
        },
        childInformation: {
          name: {
            firstName: {
              value: '',
              touched: false,
              error: null,
            },
            lastName: '',
          },
          gender: {
            value: 'Boy',
            touched: false,
            error: null,
          },
          age: {
            value: 'Unknown',
            touched: false,
            error: null,
          },
        },
      },
      WT5678: {
        callType: {
          value: 'Someone calling about a child',
        },
      },
    };

    const result = reduce(initialState, action);
    const { tasks } = result;

    expect(tasks).toEqual(expectedTasks);
  });

  test('PREPOPULATE_FORM_CALLER alters only the fields it should', () => {
    const initialState = {
      tasks: {
        WT1234: {
          callType: {
            value: 'Someone calling about a child',
          },
          callerInformation: {
            name: {
              firstName: {
                value: '',
                touched: false,
                error: null,
              },
              lastName: '',
            },
            gender: {
              value: '',
              touched: false,
              error: null,
            },
            age: {
              value: '',
              touched: false,
              error: null,
            },
          },
          childInformation: {
            name: '',
          },
        },
        WT5678: {
          callType: {
            value: 'Someone calling about a child',
          },
        },
      },
    };

    const action = {
      type: PREPOPULATE_FORM_CALLER,
      gender: 'Girl',
      age: '18-25',
      taskId: 'WT1234',
    };

    const expectedTasks = {
      WT1234: {
        callType: {
          value: 'Someone calling about a child',
        },
        callerInformation: {
          name: {
            firstName: {
              value: '',
              touched: false,
              error: null,
            },
            lastName: '',
          },
          gender: {
            value: 'Girl',
            touched: false,
            error: null,
          },
          age: {
            value: '18-25',
            touched: false,
            error: null,
          },
        },
        childInformation: {
          name: '',
        },
      },
      WT5678: {
        callType: {
          value: 'Someone calling about a child',
        },
      },
    };

    const result = reduce(initialState, action);
    const { tasks } = result;

    expect(tasks).toEqual(expectedTasks);
  });
});

/*
 * describe('handleSelectSearchResult action creator', () => {
 *   // Simulate a state for a child's call
 *   const childCalling = {
 *     tasks: {
 *       WT123: {
 *         callType: { value: callTypes.child },
 *         internal: {
 *           tab: 0,
 *         },
 *         callerInformation: {
 *           name: {
 *             firstName: {
 *               value: '',
 *               touched: false,
 *               error: null,
 *             },
 *             lastName: {
 *               value: '',
 *               touched: false,
 *               error: null,
 *             },
 *           },
 *         },
 *         childInformation: {
 *           name: {
 *             firstName: {
 *               value: 'Child',
 *               touched: true,
 *               error: null,
 *             },
 *             lastName: {
 *               value: '',
 *               touched: false,
 *               error: null,
 *             },
 *           },
 *         },
 *       },
 *     },
 *   };
 */

/*
 *   // Simulate a state for a caller's call
 *   const callerCalling = {
 *     tasks: {
 *       WT123: {
 *         callType: { value: callTypes.caller },
 *         internal: {
 *           tab: 0,
 *         },
 *         callerInformation: {
 *           name: {
 *             firstName: {
 *               value: 'Caller',
 *               touched: true,
 *               error: null,
 *             },
 *             lastName: {
 *               value: '',
 *               touched: false,
 *               error: null,
 *             },
 *           },
 *         },
 *         childInformation: {
 *           name: {
 *             firstName: {
 *               value: 'Another child',
 *               touched: true,
 *               error: null,
 *             },
 *             lastName: {
 *               value: '',
 *               touched: false,
 *               error: null,
 *             },
 *           },
 *         },
 *       },
 *     },
 *   };
 */

/*
 *   const childContact = {
 *     details: {
 *       callType: callTypes.child,
 *       callerInformation: {
 *         name: {
 *           firstName: '',
 *           lastName: '',
 *         },
 *       },
 *       childInformation: {
 *         name: {
 *           firstName: 'Stored name',
 *           lastName: 'Stored last',
 *         },
 *       },
 *     },
 *   };
 */

/*
 *   const callerContact = {
 *     details: {
 *       callType: callTypes.caller,
 *       callerInformation: {
 *         name: {
 *           firstName: 'Stored caller',
 *           lastName: '',
 *         },
 *       },
 *       childInformation: {
 *         name: {
 *           firstName: 'Stored child',
 *           lastName: '',
 *         },
 *       },
 *     },
 *   };
 */

/*
 *   const otherContact = {
 *     details: {
 *       callType: 'anything else',
 *       callerInformation: {
 *         name: {
 *           firstName: 'anything else',
 *           lastName: '',
 *         },
 *       },
 *       childInformation: {
 *         name: {
 *           firstName: 'anything else',
 *           lastName: '',
 *         },
 *       },
 *     },
 *   };
 */

/*
 *   test('Current call type SELF, selected contact type SELF', () => {
 *     const action = handleSelectSearchResult(childContact, 'WT123');
 *     const result = reduce(childCalling, action);
 *     const { callerInformation, childInformation } = result.tasks.WT123;
 */

/*
 *     const { details } = childContact;
 *     // Test if childInformation was generated from blank and then copied the values in the search result
 *     expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
 *     expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
 *     expect(childInformation.gender.value).toStrictEqual(''); // should be generated
 */

/*
 *     // Test if callerInformation was left untouched
 *     expect(callerInformation.name.firstName.value).toStrictEqual(
 *       childCalling.tasks.WT123.callerInformation.name.firstName.value,
 *     );
 *     expect(callerInformation.name.lastName.value).toStrictEqual(
 *       childCalling.tasks.WT123.callerInformation.name.lastName.value,
 *     );
 *     expect(callerInformation.gender).toBeUndefined();
 *   });
 */

/*
 *   test('Current call type SELF, selected contact type CALLER', () => {
 *     const action = handleSelectSearchResult(callerContact, 'WT123');
 *     const result = reduce(childCalling, action);
 *     const { callerInformation, childInformation } = result.tasks.WT123;
 */

/*
 *     const { details } = callerContact;
 *     // Test if childInformation was generated from blank and then copied the values in the search result
 *     expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
 *     expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
 *     expect(childInformation.gender.value).toStrictEqual(''); // should be generated
 */

/*
 *     // Test if callerInformation was left untouched
 *     expect(callerInformation.name.firstName.value).toStrictEqual(
 *       childCalling.tasks.WT123.callerInformation.name.firstName.value,
 *     );
 *     expect(callerInformation.name.lastName.value).toStrictEqual(
 *       childCalling.tasks.WT123.callerInformation.name.lastName.value,
 *     );
 *     expect(callerInformation.gender).toBeUndefined();
 *   });
 */

/*
 *   test('Current call type CALLER, selected contact type SELF', () => {
 *     const action = handleSelectSearchResult(childContact, 'WT123');
 *     const result = reduce(callerCalling, action);
 *     const { callerInformation, childInformation } = result.tasks.WT123;
 */

/*
 *     const { details } = childContact;
 *     // Test if childInformation was generated from blank and then copied the values in the search result
 *     expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
 *     expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
 *     expect(childInformation.gender.value).toStrictEqual(''); // should be generated
 */

/*
 *     // Test if callerInformation was left untouched
 *     expect(callerInformation.name.firstName.value).toStrictEqual(
 *       callerCalling.tasks.WT123.callerInformation.name.firstName.value,
 *     );
 *     expect(callerInformation.name.lastName.value).toStrictEqual(
 *       callerCalling.tasks.WT123.callerInformation.name.lastName.value,
 *     );
 *     expect(callerInformation.gender).toBeUndefined();
 *   });
 */

/*
 *   test('Current call type CALLER, selected contact type CALLER', () => {
 *     const action = handleSelectSearchResult(callerContact, 'WT123');
 *     const result = reduce(callerCalling, action);
 *     const { callerInformation, childInformation } = result.tasks.WT123;
 */

/*
 *     const { details } = callerContact;
 *     // Test if callerInformation was generated from blank and then copied the values in the search result
 *     expect(callerInformation.name.firstName.value).toStrictEqual(details.callerInformation.name.firstName);
 *     expect(callerInformation.name.lastName.value).toStrictEqual(details.callerInformation.name.lastName);
 *     expect(callerInformation.gender.value).toStrictEqual(''); // should be generated
 */

/*
 *     // Test if childInformation was left untouched
 *     expect(childInformation.name.firstName.value).toStrictEqual(
 *       callerCalling.tasks.WT123.childInformation.name.firstName.value,
 *     );
 *     expect(childInformation.name.lastName.value).toStrictEqual(
 *       callerCalling.tasks.WT123.childInformation.name.lastName.value,
 *     );
 *     expect(childInformation.gender).toBeUndefined();
 *   });
 */

/*
 *   test('Test any other combination will leave form untouched', () => {
 *     const action = handleSelectSearchResult(otherContact, 'WT123');
 */

/*
 *     const result1 = reduce(childCalling, action);
 *     const result2 = reduce(callerCalling, action);
 */

/*
 *     // Test that neither of the "current call" states would be modified
 *     expect(result1).toStrictEqual(childCalling);
 *     expect(result2).toStrictEqual(callerCalling);
 *   });
 * });
 */
