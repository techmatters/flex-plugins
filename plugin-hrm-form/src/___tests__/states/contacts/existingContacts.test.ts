import { hrmServiceContactToSearchContact } from '../../../states/contacts/contactDetailsAdapter';
import {
  loadContact,
  loadContactReducer,
  loadRawContact,
  releaseContact,
  releaseContactReducer,
  setCategoriesGridView,
  setCategoriesGridViewReducer,
  toggleCategoryExpanded,
  toggleCategoryExpandedReducer,
} from '../../../states/contacts/existingContacts';
import { SearchContact } from '../../../types/types';

const baseContact: SearchContact = {
  contactId: '1337',
  overview: {
    helpline: undefined,
    dateTime: undefined,
    name: 'Lorna Ballantyne',
    customerNumber: undefined,
    callType: undefined,
    categories: {},
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: undefined,
    createdBy: undefined,
  },
  details: {
    callType: '',
    caseInformation: { categories: {} },
    childInformation: { name: { firstName: 'Lorna', lastName: 'Ballantyne' } },
    callerInformation: undefined,
    contactlessTask: undefined,
  },
  csamReports: [],
};
jest.mock('../../../states/contacts/contactDetailsAdapter');

describe('loadContactReducer', () => {
  describe('addRef set to true', () => {
    test('Nothing currently for that ID - adds the contact with a refCount of 1 and blank categories state', () => {
      const newState = loadContactReducer({}, loadContact(baseContact));
      expect(newState[baseContact.contactId].contact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].refCount).toStrictEqual(1);
      expect(newState[baseContact.contactId].categories).toStrictEqual({ gridView: false, expanded: {} });
    });
    test('Same contact currently for that ID - bumps the refCount', () => {
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            contact: baseContact,
            refCount: 12,
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(baseContact),
      );
      expect(newState[baseContact.contactId].contact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].refCount).toStrictEqual(13);
    });
    test('Different contact currently for that ID - changes contact to one specified in action and bumps the refcount', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            contact: baseContact,
            refCount: 12,
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact),
      );
      expect(newState[baseContact.contactId].contact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].refCount).toStrictEqual(13);
    });
  });
  describe('addRef set to false', () => {
    test('Nothing currently for that ID - noop', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, false));
      expect(newState).toStrictEqual({});
    });
    test('Same contact currently for that ID - noop', () => {
      const originalState = {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 12,
          categories: { gridView: false, expanded: {} },
        },
      };
      const newState = loadContactReducer(originalState, loadContact(baseContact, false));
      expect(newState[baseContact.contactId]).toStrictEqual(originalState[baseContact.contactId]);
    });
    test('Different contact currently for that ID - changes contact to one specified in action but leaves refCount the same', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            contact: baseContact,
            refCount: 12,
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, false),
      );
      expect(newState[baseContact.contactId].contact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].refCount).toStrictEqual(12);
    });
  });
  test('loadRawContact - converts using hrmServiceContactToSearchContact before creating load contact action', () => {
    (<jest.Mock>hrmServiceContactToSearchContact).mockReturnValue(baseContact);
    const input = { id: baseContact.contactId, bleep: 'bloop' };
    const outAction = loadRawContact(input);
    expect(outAction.contact).toStrictEqual(baseContact);
    expect(outAction.id).toStrictEqual(baseContact.contactId);
    expect(hrmServiceContactToSearchContact).toHaveBeenCalledWith(input);
  });
});

describe('releaseContactReducer', () => {
  test('Nothing currently for that ID - noop', () => {
    const newState = releaseContactReducer({}, releaseContact(baseContact.contactId));
    expect(newState).toStrictEqual({});
  });
  test('Contact loaded for that ID with refCount of 2 or more - decrements refCount by one', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 2,
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId),
    );
    expect(newState[baseContact.contactId].contact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].refCount).toStrictEqual(1);
  });
  test('Contact loaded for that ID with refCount of 1 - removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 1,
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
  test('Contact loaded for that ID with refCount of less than 1 - should never be in this state but removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 0,
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
});

describe('toggleCategoryExpandedReducer', () => {
  test('Contact loaded and category present in expanded map - flips boolean state', () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 0,
          categories: {
            gridView: false,
            expanded: {
              category1: true,
            },
          },
        },
      },
      toggleCategoryExpanded(baseContact.contactId, 'category1'),
    );
    expect(newState[baseContact.contactId].categories.expanded.category1).toBe(false);
    expect(
      toggleCategoryExpandedReducer(newState, toggleCategoryExpanded(baseContact.contactId, 'category1'))[
        baseContact.contactId
      ].categories.expanded.category1,
    ).toBe(true);
  });
  test("Contact loaded and category not present in expanded map - adds it in a 'true' state", () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 0,
          categories: {
            gridView: false,
            expanded: {},
          },
        },
      },
      toggleCategoryExpanded(baseContact.contactId, 'category1'),
    );
    expect(newState[baseContact.contactId].categories.expanded.category1).toBe(true);
  });

  test('Contact not loaded - noop', () => {
    const newState = toggleCategoryExpandedReducer({}, toggleCategoryExpanded(baseContact.contactId, 'category1'));
    expect(newState).toStrictEqual({});
  });
});

describe('setCategoriesGridViewReducer', () => {
  test('Contact loaded - sets grivView state', () => {
    const newState = setCategoriesGridViewReducer(
      {
        [baseContact.contactId]: {
          contact: baseContact,
          refCount: 0,
          categories: {
            gridView: false,
            expanded: {},
          },
        },
      },
      setCategoriesGridView(baseContact.contactId, true),
    );
    expect(newState[baseContact.contactId].categories.gridView).toBe(true);
    expect(
      setCategoriesGridViewReducer(newState, setCategoriesGridView(baseContact.contactId, false))[baseContact.contactId]
        .categories.gridView,
    ).toBe(false);
  });

  test('Contact not loaded - noop', () => {
    const newState = setCategoriesGridViewReducer({}, setCategoriesGridView(baseContact.contactId, true));
    expect(newState).toStrictEqual({});
  });
});
