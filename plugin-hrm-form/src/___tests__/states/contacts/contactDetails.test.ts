import {
  ContactDetailsRoute,
  ContactDetailsState,
  DetailsContext,
  navigateContactDetails,
  navigateContactDetailsReducer,
  sectionExpandedStateReducer,
  toggleDetailSectionExpanded,
} from '../../../states/contacts/contactDetails';

const emptyState: ContactDetailsState = {
  [DetailsContext.CASE_DETAILS]: { detailsExpanded: {}, route: ContactDetailsRoute.HOME },
  [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {}, route: ContactDetailsRoute.HOME },
};

describe('sectionExpandedStateReducer', () => {
  test('Section present in details context - toggles expanded state', () => {
    const newState = sectionExpandedStateReducer(
      {
        ...emptyState,
        [DetailsContext.CASE_DETAILS]: {
          detailsExpanded: { 'Caller information': true },
          route: ContactDetailsRoute.HOME,
        },
      },
      toggleDetailSectionExpanded(DetailsContext.CASE_DETAILS, 'Caller information'),
    );
    expect(newState[DetailsContext.CASE_DETAILS].detailsExpanded['Caller information']).toBe(false);
    expect(
      sectionExpandedStateReducer(
        newState,
        toggleDetailSectionExpanded(DetailsContext.CASE_DETAILS, 'Caller information'),
      )[DetailsContext.CASE_DETAILS].detailsExpanded['Caller information'],
    ).toBe(true);
  });
  test('Section not present in details context - sets expanded state true', () => {
    const newState = sectionExpandedStateReducer(
      emptyState,
      toggleDetailSectionExpanded(DetailsContext.CASE_DETAILS, 'Child information'),
    );
    expect(newState[DetailsContext.CASE_DETAILS].detailsExpanded['Child information']).toBe(true);
  });
});

describe('navigateContactDetailsReducer', () => {
  test('Sets the route in the specified context, changing nothing else in the state', () => {
    const newState = navigateContactDetailsReducer(
      emptyState,
      navigateContactDetails(DetailsContext.CONTACT_SEARCH, ContactDetailsRoute.EDIT_CATEGORIES),
    );
    expect(newState).toStrictEqual({
      ...emptyState,
      [DetailsContext.CONTACT_SEARCH]: {
        ...emptyState[DetailsContext.CONTACT_SEARCH],
        route: ContactDetailsRoute.EDIT_CATEGORIES,
      },
    });
  });
});
