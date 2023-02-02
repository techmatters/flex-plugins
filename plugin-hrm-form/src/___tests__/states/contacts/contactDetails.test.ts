/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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
