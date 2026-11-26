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
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import '@testing-library/jest-dom/extend-expect';

import { baseMockConfig } from '../../mockGetConfig';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import ResourceSearchFilters from '../../../components/resources/mappingComponents/uschMappings/ResourceSearchFilters';
import { namespace, referrableResourcesBase } from '../../../states/storeNamespaces';

let mockResolveCategories: () => void;
const mockLoadedLists: string[] = [];

jest.mock('../../../components/resources/mappingComponents', () => ({
  getFilterSelectionState: () => ({
    loadReferenceActionFunction: (list: string) => () => {
      mockLoadedLists.push(list);
      return list === 'categories'
        ? new Promise(resolve => {
            mockResolveCategories = () => resolve({ list, options: [] });
          })
        : Promise.resolve({ list, options: [] });
    },
  }),
}));

const renderFilters = (categoryOptions: { value: string; label: string }[] = []) => {
  const store = configureMockStore([promiseMiddleware])({
    [namespace]: {
      [referrableResourcesBase]: {
        search: {
          referenceLocations: { categoryOptions },
          filterOptions: { country: [], province: [], city: [], categories: categoryOptions },
          parameters: { filterSelections: {} },
        },
      },
    },
  });
  render(
    <Provider store={store}>
      <ResourceSearchFilters />
    </Provider>,
  );
};

const mockCategoryFiltersFlag = (enabled: boolean) =>
  (getAseloFeatureFlags as jest.Mock).mockReturnValue({
    ...baseMockConfig.featureFlags,
    // eslint-disable-next-line camelcase
    enable_category_filters: enabled,
  });

beforeEach(() => {
  mockLoadedLists.length = 0;
  mockCategoryFiltersFlag(true);
});

describe('USCH ResourceSearchFilters - categories feature flag', () => {
  test('hides the categories filter and does not load categories when the flag is off', async () => {
    mockCategoryFiltersFlag(false);
    await act(async () => renderFilters());

    expect(screen.queryByText('Resources-Search-categories')).not.toBeInTheDocument();
    expect(mockLoadedLists).not.toContain('categories');
  });

  test('shows the categories filter when the flag is on', () => {
    renderFilters();

    expect(screen.getByText('Resources-Search-categories')).toBeInTheDocument();
  });
});

describe('USCH ResourceSearchFilters - categories loading', () => {
  test('shows a spinner until the categories have been fetched', async () => {
    renderFilters();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await act(async () => mockResolveCategories());

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('does not show a spinner when the categories were already loaded', () => {
    renderFilters([{ value: 'Food', label: 'Food' }]);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
