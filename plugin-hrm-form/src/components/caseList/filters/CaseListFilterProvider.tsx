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
import DateRangeFilter from './DateRangeFilter';
import { DateFilterValue } from '../../../states/caseList/dateFilters';
import { DateFilter } from './dateFilters';

type FilterComponentBaseProps = {
  name: string;
  openedFilter: string | undefined;
  setOpenedFilter: (filter: string | undefined) => void;
};

type FilterDataProps = {
  strings: Record<string, string>;
  statusValues?: Item[];
  counselorValues?: Item[];
  dateFilterValues?: Record<string, DateFilterValue | undefined>;
  dateFilters?: DateFilter[];
  handleApplyStatusFilter?: (values: Item[]) => void;
  handleApplyCounselorFilter?: (values: Item[]) => void;
  handleApplyDateRangeFilter?: (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => void;
};

// Status Filter Component
const StatusFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = props => {
  const { strings, statusValues = [], handleApplyStatusFilter, ...baseProps } = props;

  return (
    <MultiSelectFilter
      {...baseProps}
      textCode="CaseList-Filters-Status"
      defaultValues={statusValues}
      applyFilter={handleApplyStatusFilter}
      name="status"
    />
  );
};

// Counselor Filter Component
const CounselorFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = props => {
  const { strings, counselorValues = [], handleApplyCounselorFilter, ...baseProps } = props;

  return (
    <MultiSelectFilter
      {...baseProps}
      searchDescription={strings['CaseList-Filters-SearchForCounselor']}
      textCode="CaseList-Filters-Counselor"
      defaultValues={counselorValues}
      applyFilter={handleApplyCounselorFilter}
      searchable={true}
      name="counselor"
    />
  );
};

// Created Date Filter Component
const CreatedDateFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = props => {
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
const UpdatedDateFilter: React.FC<FilterComponentBaseProps & FilterDataProps> = props => {
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

const FilterComponents: Record<string, React.ComponentType<FilterComponentBaseProps & FilterDataProps>> = {
  'generate-status-filter': StatusFilter,
  'generate-counselor-filter': CounselorFilter,
  'generate-created-date-filter': CreatedDateFilter,
  'generate-updated-date-filter': UpdatedDateFilter,
};

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

  // Pre-check for date filter components to avoid unnecessary rendering
  if (componentId === 'generate-created-date-filter') {
    if (!filterData.handleApplyDateRangeFilter) return null;
    if (!filterData.dateFilters?.some(f => f.filterPayloadParameter === 'createdAt')) return null;
  }

  if (componentId === 'generate-updated-date-filter') {
    if (!filterData.handleApplyDateRangeFilter) return null;
    if (!filterData.dateFilters?.some(f => f.filterPayloadParameter === 'updatedAt')) return null;
  }

  return <FilterComponent {...baseProps} {...filterData} />;
};
