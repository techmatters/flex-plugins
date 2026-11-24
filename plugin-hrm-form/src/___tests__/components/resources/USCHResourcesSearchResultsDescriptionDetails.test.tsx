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

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import ResourcesSearchResultsDescriptionDetails from '../../../components/resources/mappingComponents/uschMappings/ResourcesSearchResultsDescriptionDetails';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';
import { USCHFilterSelections } from '../../../states/resources/filterSelectionState/usch';

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Template: ({ code, count }: { code: string; count?: number }) => <span>{`${code}:${count}`}</span>,
}));

const renderWithSelections = (filterSelections: USCHFilterSelections) => {
  const store = configureMockStore([])({
    [namespace]: {
      [referrableResourcesBase]: {
        search: {
          filterOptions: { country: [], province: [], city: [], categories: [] },
          parameters: { filterSelections },
        },
      },
    },
  });
  render(
    <Provider store={store}>
      <ResourcesSearchResultsDescriptionDetails />
    </Provider>,
  );
};

describe('USCH ResourcesSearchResultsDescriptionDetails', () => {
  test('shows how many categories are selected', () => {
    renderWithSelections({ categories: ['Food', 'Housing'] });

    expect(screen.getByText('Resources-Search-ResultsDescription-Categories:2')).toBeInTheDocument();
  });

  test('does not mention categories when none are selected', () => {
    renderWithSelections({});

    expect(screen.queryByText(/Resources-Search-ResultsDescription-Categories/)).not.toBeInTheDocument();
  });
});
