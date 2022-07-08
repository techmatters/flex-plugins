import {
  ContactDetailsState,
  DetailsContext,
  sectionExpandedStateReducer,
  toggleDetailSectionExpanded,
} from '../../../states/contacts/contactDetails';

const emptyState: ContactDetailsState = {
  [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
  [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
};

describe('sectionExpandedStateReducer', () => {
  test('Section present in details context - toggles expanded state', () => {
    const newState = sectionExpandedStateReducer(
      {
        ...emptyState,
        [DetailsContext.CASE_DETAILS]: {
          detailsExpanded: { 'Caller information': true },
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
