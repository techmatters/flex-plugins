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

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { getFilterComponent } from '../../../../components/caseList/filters/CaseListFilterProvider';
import { dateFilterOptionsInPast } from '../../../../components/caseList/filters/dateFilters';
import { Category } from '../../../../components/caseList/filters/CategoriesFilter';
import { Item } from '../../../../components/caseList/filters/MultiSelectFilter';

const themeConf = {};

describe('CaseListFilterProvider', () => {
  const baseProps = {
    name: 'test-filter',
    openedFilter: undefined,
    setOpenedFilter: jest.fn(),
  };

  const strings = {
    'CaseList-Filters-Status': 'Status',
    'CaseList-Filters-Counselor': 'Counselor',
    'CaseList-Filters-Categories': 'Categories',
    'CaseList-Filters-SearchForCounselor': 'Search for counselor',
    'CaseList-Filters-SearchByCategory': 'Search by category',
  };

  const filterData = {
    strings,
    statusValues: [
      { value: 'open', label: 'Open', checked: false },
      { value: 'closed', label: 'Closed', checked: true },
    ],
    counselorValues: [
      { value: 'counselor1', label: 'Counselor 1', checked: false },
      { value: 'counselor2', label: 'Counselor 2', checked: false },
    ],
    categoriesValues: [
      {
        categoryName: 'Category 1',
        subcategories: [
          { value: 'subcat1', label: 'Subcategory 1', checked: false },
          { value: 'subcat2', label: 'Subcategory 2', checked: false },
        ],
      },
    ],
    dateFilters: [
      {
        labelKey: 'CaseList-Filters-DateFilter-CreatedAt',
        filterPayloadParameter: 'createdAt',
        options: dateFilterOptionsInPast(),
      },
      {
        labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
        filterPayloadParameter: 'updatedAt',
        options: dateFilterOptionsInPast(),
      },
    ],
    dateFilterValues: {},
    handleApplyStatusFilter: jest.fn(),
    handleApplyCounselorFilter: jest.fn(),
    handleApplyCategoriesFilter: jest.fn(),
    handleApplyDateRangeFilter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null for unknown/invalid filter', () => {
    const result = getFilterComponent('unknown-filter', baseProps, filterData);
    expect(result).toBeNull();
  });

  test('renders StatusFilter component', () => {
    const component = getFilterComponent('generate-status-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    const statusButton = screen.getByRole('button', { name: /Status/i });
    expect(statusButton).toBeInTheDocument();
  });

  test('renders CounselorFilter component', () => {
    const component = getFilterComponent('generate-counselor-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    const counselorButton = screen.getByRole('button', { name: /Counselor/i });
    expect(counselorButton).toBeInTheDocument();
  });

  test('renders CategoryFilter component', () => {
    const component = getFilterComponent('generate-category-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    const categoriesButton = screen.getByRole('button', { name: /Categories/i });
    expect(categoriesButton).toBeInTheDocument();
  });

  test('renders CreatedDateFilter component', () => {
    const component = getFilterComponent('generate-created-date-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders UpdatedDateFilter component', () => {
    const component = getFilterComponent('generate-updated-date-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('CreatedDateFilter applies correct filter properties', () => {
    const component = getFilterComponent('generate-created-date-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('name', 'createdAtFilter');
  });

  test('UpdatedDateFilter applies correct filter properties', () => {
    const component = getFilterComponent('generate-updated-date-filter', baseProps, filterData);
    
    render(
      <StorelessThemeProvider themeConf={themeConf}>
        {component}
      </StorelessThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('name', 'updatedAtFilter');
  });

  test('returns null for date filters when handler is not provided', () => {
    const dataWithoutHandler = { 
      ...filterData, 
      handleApplyDateRangeFilter: undefined 
    };
    
    const component = getFilterComponent('generate-created-date-filter', baseProps, dataWithoutHandler);
    expect(component).toBeNull();
  });

  test('returns null for date filters when filter definition is not found', () => {
    const dataWithMissingCreatedAt = { 
      ...filterData, 
      dateFilters: [{
        labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
        filterPayloadParameter: 'updatedAt',
        options: dateFilterOptionsInPast(),
      }]
    };
    
    const component = getFilterComponent('generate-created-date-filter', baseProps, dataWithMissingCreatedAt);
    expect(component).toBeNull();
  });
});
