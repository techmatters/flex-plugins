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

import MultiSelectFilter, { Item } from './MultiSelectFilter';
import CategoriesFilter, { Category } from './CategoriesFilter';
import DateRangeFilter from './DateRangeFilter';
import { DateFilterValue } from '../../../states/caseList/dateFilters';
import { DateFilter } from './dateFilters';

type FilterComponentBaseProps = {
  name: string;
  openedFilter: string | undefined;
  setOpenedFilter: (filter: string | undefined) => void;
};

// This type allows any additional properties while preserving the base props
type FilterProps = FilterComponentBaseProps & Record<string, any>;

type FilterDataProps = {
  strings: Record<string, string>;
  statusValues?: Item[];
  counselorValues?: Item[];
  categoriesValues?: Category[];
  dateFilterValues?: Record<string, DateFilterValue | undefined>;
  dateFilters?: DateFilter[];
  handleApplyStatusFilter?: (values: Item[]) => void;
  handleApplyCounselorFilter?: (values: Item[]) => void;
  handleApplyCategoriesFilter?: (values: Category[]) => void;
  handleApplyDateRangeFilter?: (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => void;
};

// Status Filter Component
const StatusFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = (props) => {
  const { strings, statusValues = [], handleApplyStatusFilter, ...baseProps } = props;
  
  return (
    <MultiSelectFilter
      {...baseProps}
      text={strings['CaseList-Filters-Status']}
      defaultValues={statusValues}
      applyFilter={handleApplyStatusFilter}
      name="status"
    />
  );
};

// Counselor Filter Component
const CounselorFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = (props) => {
  const { strings, counselorValues = [], handleApplyCounselorFilter, ...baseProps } = props;
  
  return (
    <MultiSelectFilter
      {...baseProps}
      searchDescription={strings['CaseList-Filters-SearchForCounselor']}
      text={strings['CaseList-Filters-Counselor']}
      defaultValues={counselorValues}
      applyFilter={handleApplyCounselorFilter}
      searchable={true}
      name="counselor"
    />
  );
};

// Categories Filter Component
const CategoryFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = (props) => {
  const { strings, categoriesValues = [], handleApplyCategoriesFilter, ...baseProps } = props;
  
  return (
    <CategoriesFilter
      {...baseProps}
      searchDescription={strings['CaseList-Filters-SearchByCategory']}
      text={strings['CaseList-Filters-Categories']}
      defaultValues={categoriesValues}
      applyFilter={handleApplyCategoriesFilter}
      searchable={true}
      name="categories"
    />
  );
};

// Created Date Filter Component
const CreatedDateFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = (props) => {
  const { dateFilters = [], dateFilterValues = {}, handleApplyDateRangeFilter, ...baseProps } = props;
  
  if (!handleApplyDateRangeFilter) return null;
  
  const df = dateFilters.find(f => f.filterPayloadParameter === 'createdAt');
  if (!df) return null;

  return (
    <DateRangeFilter
      {...baseProps}
      name={`${df.filterPayloadParameter}Filter`}
      labelKey={df.labelKey}
      options={df.options}
      current={dateFilterValues[df.filterPayloadParameter]}
      applyFilter={handleApplyDateRangeFilter(df)}
      allowFutureDates={true}
    />
  );
};

// Updated Date Filter Component
const UpdatedDateFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = (props) => {
  const { dateFilters = [], dateFilterValues = {}, handleApplyDateRangeFilter, ...baseProps } = props;
  
  if (!handleApplyDateRangeFilter) return null;
  
  const df = dateFilters.find(f => f.filterPayloadParameter === 'updatedAt');
  if (!df) return null;

  return (
    <DateRangeFilter
      {...baseProps}
      name={`${df.filterPayloadParameter}Filter`}
      labelKey={df.labelKey}
      options={df.options}
      current={dateFilterValues[df.filterPayloadParameter]}
      applyFilter={handleApplyDateRangeFilter(df)}
      allowFutureDates={true}
    />
  );
};

// A registry mapping component IDs to component implementations
const FilterComponents: Record<string, React.ComponentType<FilterComponentBaseProps & FilterDataProps>> = {
  'generate-status-filter': StatusFilter,
  'generate-counselor-filter': CounselorFilter,
  'generate-category-filter': CategoryFilter,
  'generate-created-date-filter': CreatedDateFilter,
  'generate-updated-date-filter': UpdatedDateFilter,
};

/**
 * Returns the appropriate filter component type based on component ID
 */
export const getFilterComponent = (
  componentId: string,
  baseProps: FilterComponentBaseProps,
  filterData: FilterDataProps,
): React.ReactElement | null => {
  const FilterComponent = FilterComponents[componentId];
  
  if (!FilterComponent) {
    console.warn(`No filter component registered for ID: ${componentId}`);
    return null;
  }
  
  return <FilterComponent {...baseProps} {...filterData} />;
};