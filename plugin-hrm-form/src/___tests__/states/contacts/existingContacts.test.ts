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
  describe('replaceExisting set to false', () => {
    test('Nothing currently for that ID - adds the contact with provided reference and blank categories state', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE'));
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
      expect(newState[baseContact.contactId].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Same contact currently loaded for that ID with a different reference - leaves contact the same and adds the reference', () => {
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(baseContact, 'ANOTHER_TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Different contact currently for that ID - leaves contact the same and adds the reference', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Same reference as a contact already loaded - does nothing', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
    });
  });

  describe('replaceExisting set to true', () => {
    test('Nothing currently for that ID - adds the contact with provided reference and blank categories state', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE', true));
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
      expect(newState[baseContact.contactId].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Same contact currently for that ID, with different reference - adds reference', () => {
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(baseContact, 'ANOTHER_TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Different contact currently for that ID - replaces and adds the reference', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Same reference as a contact already loaded - replaces contact but leaves references the same', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
    });
  });

  test('loadRawContact - converts using hrmServiceContactToSearchContact before creating load contact action', () => {
    (<jest.Mock>hrmServiceContactToSearchContact).mockReturnValue(baseContact);
    const input = { id: baseContact.contactId, bleep: 'bloop' };
    const outAction = loadRawContact(input, 'TEST_REFERENCE');
    expect(outAction.contact).toStrictEqual(baseContact);
    expect(outAction.id).toStrictEqual(baseContact.contactId);
    expect(outAction.reference).toEqual('TEST_REFERENCE');
    expect(hrmServiceContactToSearchContact).toHaveBeenCalledWith(input);
  });
});

describe('releaseContactReducer', () => {
  test('Nothing currently for that ID - noop', () => {
    const newState = releaseContactReducer({}, releaseContact(baseContact.contactId, 'TEST_REFERENCE'));
    expect(newState).toStrictEqual({});
  });
  test('Contact loaded for that ID with that reference and others - removes that reference', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_TEST_REFERENCE')).toBeTruthy();
  });
  test('Contact loaded for that ID with just that reference - removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
  test('Contact loaded for that ID but not the specified reference - does nothing', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['ANOTHER_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_REFERENCE')).toBeTruthy();
  });
  test('Contact loaded for that ID with no references - should never be in this state but removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'ANYTHING'),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
});

describe('toggleCategoryExpandedReducer', () => {
  test('Contact loaded and category present in expanded map - flips boolean state', () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
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
          savedContact: baseContact,
          references: new Set('x'),
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
          savedContact: baseContact,
          references: new Set('x'),
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
