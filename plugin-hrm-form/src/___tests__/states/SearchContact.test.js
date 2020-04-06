import fromentries from 'fromentries';
import { omit } from 'lodash';

import { SEARCH_CONTACTS_SUCCESS, SEARCH_CONTACTS_FAILURE, REMOVE_CONTACT_STATE } from '../../states/ActionTypes';
import { reduce as ContactStateReducer } from '../../states/ContactState';
import {
  changeSearchPage,
  handleSelectSearchResult,
  handleSearchFormChange,
  recreateSearchContact,
  reduce as SearchFormReducer,
  SearchPages,
  viewContactDetails,
} from '../../states/SearchContact';
import callTypes from '../../states/DomainConstants';

Object.fromEntries = fromentries;
/*
 * (Gian) while this function lives inside SearchContact, it actually targets ContactState's reducer.
 * Should this test be in here?
 */
describe('handleSelectSearchResult action creator', () => {
  // Simulate a state for a child's call
  const childCalling = {
    tasks: {
      WT123: {
        callType: { value: callTypes.child },
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
            lastName: {
              value: '',
              touched: false,
              error: null,
            },
          },
        },
        childInformation: {
          name: {
            firstName: {
              value: 'Child',
              touched: true,
              error: null,
            },
            lastName: {
              value: '',
              touched: false,
              error: null,
            },
          },
        },
      },
    },
  };

  // Simulate a state for a caller's call
  const callerCalling = {
    tasks: {
      WT123: {
        callType: { value: callTypes.caller },
        internal: {
          tab: 0,
        },
        callerInformation: {
          name: {
            firstName: {
              value: 'Caller',
              touched: true,
              error: null,
            },
            lastName: {
              value: '',
              touched: false,
              error: null,
            },
          },
        },
        childInformation: {
          name: {
            firstName: {
              value: 'Another child',
              touched: true,
              error: null,
            },
            lastName: {
              value: '',
              touched: false,
              error: null,
            },
          },
        },
      },
    },
  };

  const childContact = {
    details: {
      callType: callTypes.child,
      callerInformation: {
        name: {
          firstName: '',
          lastName: '',
        },
      },
      childInformation: {
        name: {
          firstName: 'Stored name',
          lastName: 'Stored last',
        },
      },
    },
  };

  const callerContact = {
    details: {
      callType: callTypes.caller,
      callerInformation: {
        name: {
          firstName: 'Stored caller',
          lastName: '',
        },
      },
      childInformation: {
        name: {
          firstName: 'Stored child',
          lastName: '',
        },
      },
    },
  };

  const otherContact = {
    details: {
      callType: 'anything else',
      callerInformation: {
        name: {
          firstName: 'anything else',
          lastName: '',
        },
      },
      childInformation: {
        name: {
          firstName: 'anything else',
          lastName: '',
        },
      },
    },
  };

  test('Current call type SELF, selected contact type SELF', () => {
    const action = handleSelectSearchResult(childContact, 'WT123');
    const result = ContactStateReducer(childCalling, action);
    const { callerInformation, childInformation } = result.tasks.WT123;

    const { details } = childContact;
    // Test if childInformation was generated from blank and then copied the values in the search result
    expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
    expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
    expect(childInformation.gender.value).toStrictEqual(''); // should be generated

    // Test if callerInformation was left untouched
    expect(callerInformation.name.firstName.value).toStrictEqual(
      childCalling.tasks.WT123.callerInformation.name.firstName.value,
    );
    expect(callerInformation.name.lastName.value).toStrictEqual(
      childCalling.tasks.WT123.callerInformation.name.lastName.value,
    );
    expect(callerInformation.gender).toBeUndefined();
  });

  test('Current call type SELF, selected contact type CALLER', () => {
    const action = handleSelectSearchResult(callerContact, 'WT123');
    const result = ContactStateReducer(childCalling, action);
    const { callerInformation, childInformation } = result.tasks.WT123;

    const { details } = callerContact;
    // Test if childInformation was generated from blank and then copied the values in the search result
    expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
    expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
    expect(childInformation.gender.value).toStrictEqual(''); // should be generated

    // Test if callerInformation was left untouched
    expect(callerInformation.name.firstName.value).toStrictEqual(
      childCalling.tasks.WT123.callerInformation.name.firstName.value,
    );
    expect(callerInformation.name.lastName.value).toStrictEqual(
      childCalling.tasks.WT123.callerInformation.name.lastName.value,
    );
    expect(callerInformation.gender).toBeUndefined();
  });

  test('Current call type CALLER, selected contact type SELF', () => {
    const action = handleSelectSearchResult(childContact, 'WT123');
    const result = ContactStateReducer(callerCalling, action);
    const { callerInformation, childInformation } = result.tasks.WT123;

    const { details } = childContact;
    // Test if childInformation was generated from blank and then copied the values in the search result
    expect(childInformation.name.firstName.value).toStrictEqual(details.childInformation.name.firstName);
    expect(childInformation.name.lastName.value).toStrictEqual(details.childInformation.name.lastName);
    expect(childInformation.gender.value).toStrictEqual(''); // should be generated

    // Test if callerInformation was left untouched
    expect(callerInformation.name.firstName.value).toStrictEqual(
      callerCalling.tasks.WT123.callerInformation.name.firstName.value,
    );
    expect(callerInformation.name.lastName.value).toStrictEqual(
      callerCalling.tasks.WT123.callerInformation.name.lastName.value,
    );
    expect(callerInformation.gender).toBeUndefined();
  });

  test('Current call type CALLER, selected contact type CALLER', () => {
    const action = handleSelectSearchResult(callerContact, 'WT123');
    const result = ContactStateReducer(callerCalling, action);
    const { callerInformation, childInformation } = result.tasks.WT123;

    const { details } = callerContact;
    // Test if callerInformation was generated from blank and then copied the values in the search result
    expect(callerInformation.name.firstName.value).toStrictEqual(details.callerInformation.name.firstName);
    expect(callerInformation.name.lastName.value).toStrictEqual(details.callerInformation.name.lastName);
    expect(callerInformation.gender.value).toStrictEqual(''); // should be generated

    // Test if childInformation was left untouched
    expect(childInformation.name.firstName.value).toStrictEqual(
      callerCalling.tasks.WT123.childInformation.name.firstName.value,
    );
    expect(childInformation.name.lastName.value).toStrictEqual(
      callerCalling.tasks.WT123.childInformation.name.lastName.value,
    );
    expect(childInformation.gender).toBeUndefined();
  });

  test('Test any other combination will leave form untouched', () => {
    const action = handleSelectSearchResult(otherContact, 'WT123');

    const result1 = ContactStateReducer(childCalling, action);
    const result2 = ContactStateReducer(callerCalling, action);

    // Test that neither of the "current call" states would be modified
    expect(result1).toStrictEqual(childCalling);
    expect(result2).toStrictEqual(callerCalling);
  });
});

describe('SearchContact reducer', () => {
  const initialState = {
    tasks: {},
    isRequesting: false,
    error: null,
  };
  const newTaskEntry = {
    currentPage: SearchPages.form,
    currentContact: null,
    form: {
      firstName: '',
      lastName: '',
      counselor: { label: '', value: '' },
      phoneNumber: '',
      dateFrom: '',
      dateTo: '',
    },
    searchResult: [],
  };
  const task = { taskSid: 'WT123' };

  let state = null;
  test('recreateSearchContact action creator', () => {
    const action = recreateSearchContact(task.taskSid);
    const result = SearchFormReducer(initialState, action);

    const { tasks } = result;
    expect(tasks[task.taskSid]).not.toBeUndefined();
    expect(tasks[task.taskSid]).toStrictEqual(newTaskEntry);
    state = result;
  });

  test('handleSearchFormChange action creator', () => {
    const action = handleSearchFormChange(task.taskSid)('firstName', 'Somevalue');
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].form.firstName).toEqual('Somevalue');
    state = result;
  });

  test('handleSearchFormChange action creator', () => {
    const action = handleSearchFormChange(task.taskSid)('firstName', 'Somevalue');
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].form.firstName).toEqual('Somevalue');
    state = result;
  });

  test('changeSearchPage action creator', () => {
    const action = changeSearchPage(task.taskSid)(SearchPages.results);
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].currentPage).toEqual(SearchPages.results);
    state = result;
  });

  test('viewContactDetails action creator', () => {
    const contact = { contactId: 'fake contact', overview: {}, details: {}, counselor: '', tags: [] };
    const action = viewContactDetails(task.taskSid)(contact);
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].currentPage).toEqual(SearchPages.details);
    expect(tasks[task.taskSid].currentContact).toEqual(contact);
    state = result;
  });

  test('SEARCH_CONTACTS_SUCCESS action', () => {
    const searchResult = [
      { contactId: 'fake contact result 1', overview: {}, details: {}, counselor: '', tags: [] },
      { contactId: 'fake contact result 2', overview: {}, details: {}, counselor: '', tags: [] },
    ];
    const action = { type: SEARCH_CONTACTS_SUCCESS, searchResult, taskId: task.taskSid };
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    expect(tasks[task.taskSid].searchResult).toStrictEqual(searchResult);
    state = result;
  });

  test('SEARCH_CONTACTS_FAILURE action', () => {
    const action = { type: SEARCH_CONTACTS_FAILURE, error: 'Some error' };
    const result = SearchFormReducer(state, action);

    expect(omit(result, 'error')).toStrictEqual(omit(state, 'error'));
    expect(result.error).toBe('Some error');
    state = result;
  });

  test('REMOVE_CONTACT_STATE action', () => {
    const action = { type: REMOVE_CONTACT_STATE, taskId: task.taskSid };
    const result = SearchFormReducer(state, action);

    const { tasks } = result;
    // Test if childInformation was generated from blank and then copied the values in the search result
    expect(tasks[task.taskSid]).toBeUndefined();
    state = result;
  });
});
