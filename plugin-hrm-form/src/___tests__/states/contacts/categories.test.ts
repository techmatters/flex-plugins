import { RecursivePartial } from '../../RecursivePartial';
import { toggleSubCategoriesReducer, toggleSubcategory } from '../../../states/contacts/categories';
import { ContactsState } from '../../../states/contacts/types';

describe('dispatch toggleSubcategory action', () => {
  let BASELINE_STATE: ContactsState;

  beforeEach(() => {
    const partialBaselineState: RecursivePartial<ContactsState> = {
      existingContacts: {
        'test-contact': {
          savedContact: {
            rawJson: {
              categories: {
                'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
              },
            },
          },
          draftContact: {
            rawJson: {
              categories: {
                'test-category': ['sub-1', 'sub-2', 'sub-3'],
              },
            },
          },
        },
      },
    };
    BASELINE_STATE = partialBaselineState as ContactsState;
  });

  const withDraftCategories = (baseState: ContactsState, categories: Record<string, string[]>): ContactsState => ({
    ...baseState,
    existingContacts: {
      ...baseState.existingContacts,
      'test-contact': {
        ...baseState.existingContacts['test-contact'],
        draftContact: {
          ...baseState.existingContacts['test-contact'].draftContact,
          rawJson: {
            ...baseState.existingContacts['test-contact'].draftContact?.rawJson,
            categories,
          },
        },
      },
    },
  });

  test('Contact missing - NOOP', () => {
    const updated = toggleSubCategoriesReducer(
      BASELINE_STATE,
      toggleSubcategory('missing-contact', 'test-category', 'sub-1'),
    );
    expect(updated).toEqual(BASELINE_STATE);
  });

  test('Draft not set - creates one from saved data & adds action category/subcategory', () => {
    delete BASELINE_STATE.existingContacts['test-contact'].draftContact;
    const updated = toggleSubCategoriesReducer(
      BASELINE_STATE,
      toggleSubcategory('test-contact', 'test-category', 'sub-new-1'),
    );
    expect(updated).toEqual(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
        'test-category': ['sub-new-1'],
      }),
    );
  });

  test('Draft set with existing categories - updates with saved data & action', () => {
    const updated = toggleSubCategoriesReducer(
      BASELINE_STATE,
      toggleSubcategory('test-contact', 'test-category', 'sub-new-1'),
    );
    expect(updated).toEqual(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
        'test-category': ['sub-1', 'sub-2', 'sub-3', 'sub-new-1'],
      }),
    );
  });

  test('Action category/subcategory already set in draft - removes', () => {
    const updated = toggleSubCategoriesReducer(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
        'test-category': ['sub-1', 'sub-2', 'sub-3'],
        'new-category': ['sub-1'],
      }),
      toggleSubcategory('test-contact', 'test-category', 'sub-1'),
    );
    expect(updated).toEqual(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
        'test-category': ['sub-2', 'sub-3'],
        'new-category': ['sub-1'],
      }),
    );
  });

  test('Toggle subcategory that already exists but in different category - adds it to the new category', () => {
    const updated = toggleSubCategoriesReducer(
      BASELINE_STATE,
      toggleSubcategory('test-contact', 'new-category', 'sub-1'),
    );
    expect(updated).toEqual(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1', 'sub-2', 'sub-3'],
        'test-category': ['sub-1', 'sub-2', 'sub-3'],
        'new-category': ['sub-1'],
      }),
    );
  });
  test('Action sets subcategory present in saved version but not draft - overwrites with single subcategory selected', () => {
    const updated = toggleSubCategoriesReducer(
      BASELINE_STATE,
      toggleSubcategory('test-contact', 'saved-test-category', 'sub-1'),
    );
    expect(updated).toEqual(
      withDraftCategories(BASELINE_STATE, {
        'saved-test-category': ['sub-1'],
        'test-category': ['sub-1', 'sub-2', 'sub-3'],
      }),
    );
  });
});
