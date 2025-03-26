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

type FilterComponentConfig = FilterComponentBaseProps & {
  [key: string]: any;
};

const createFilterComponentRegistry = () => {
  const registry: Record<string, React.ComponentType<any>> = {};

  return {
    register: (componentId: string, component: React.ComponentType<any>): void => {
      registry[componentId] = component;
    },

    get: (componentId: string): React.ComponentType<any> | undefined => {
      return registry[componentId];
    },
  };
};

const FilterComponentRegistry = createFilterComponentRegistry();

FilterComponentRegistry.register('generate-status-filter', MultiSelectFilter);
FilterComponentRegistry.register('generate-counselor-filter', MultiSelectFilter);
FilterComponentRegistry.register('generate-category-filter', CategoriesFilter);
FilterComponentRegistry.register('generate-created-date-filter', DateRangeFilter);
FilterComponentRegistry.register('generate-updated-date-filter', DateRangeFilter);

const configureStatusFilter = (
  props: FilterComponentConfig,
  strings: Record<string, string>,
  statusValues?: Item[],
  handleApplyStatusFilter?: (values: Item[]) => void,
): FilterComponentConfig => ({
  ...props,
  text: strings['CaseList-Filters-Status'],
  defaultValues: statusValues || [],
  applyFilter: handleApplyStatusFilter,
  name: 'status',
});

const configureCounselorFilter = (
  props: FilterComponentConfig,
  strings: Record<string, string>,
  counselorValues?: Item[],
  handleApplyCounselorFilter?: (values: Item[]) => void,
): FilterComponentConfig => ({
  ...props,
  searchDescription: strings['CaseList-Filters-SearchForCounselor'],
  text: strings['CaseList-Filters-Counselor'],
  defaultValues: counselorValues || [],
  applyFilter: handleApplyCounselorFilter,
  searchable: true,
  name: 'counselor',
});

const configureCategoriesFilter = (
  props: FilterComponentConfig,
  strings: Record<string, string>,
  categoriesValues?: Category[],
  handleApplyCategoriesFilter?: (values: Category[]) => void,
): FilterComponentConfig => ({
  ...props,
  searchDescription: strings['CaseList-Filters-SearchByCategory'],
  text: strings['CaseList-Filters-Categories'],
  defaultValues: categoriesValues || [],
  applyFilter: handleApplyCategoriesFilter,
  searchable: true,
  name: 'categories',
});

const configureDateFilter = (
  props: FilterComponentConfig,
  dateFilters: DateFilter[] | undefined,
  dateFilterValues: Record<string, DateFilterValue | undefined> | undefined,
  handleApplyDateRangeFilter: ((filter: DateFilter) => (filterValue: DateFilterValue | undefined) => void) | undefined,
  filterPayloadParameter: string,
): FilterComponentConfig => {
  if (!dateFilters || !handleApplyDateRangeFilter) return props;

  const df = dateFilters.find(f => f.filterPayloadParameter === filterPayloadParameter);
  if (!df) return props;

  return {
    ...props,
    name: `${df.filterPayloadParameter}Filter`,
    labelKey: df.labelKey,
    options: df.options,
    current: dateFilterValues?.[df.filterPayloadParameter],
    applyFilter: handleApplyDateRangeFilter(df),
  };
};

export const getFilterComponentProps = (
  componentId: string,
  filterName: string,
  baseProps: FilterComponentBaseProps,
  filterData: {
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
  },
): FilterComponentConfig => {
  const {
    strings,
    statusValues,
    counselorValues,
    categoriesValues,
    dateFilterValues,
    dateFilters,
    handleApplyStatusFilter,
    handleApplyCounselorFilter,
    handleApplyCategoriesFilter,
    handleApplyDateRangeFilter,
  } = filterData;

  let props: FilterComponentConfig = { ...baseProps };

  if (componentId === 'generate-status-filter') {
    props = configureStatusFilter(props, strings, statusValues, handleApplyStatusFilter);
  } else if (componentId === 'generate-counselor-filter') {
    props = configureCounselorFilter(props, strings, counselorValues, handleApplyCounselorFilter);
  } else if (componentId === 'generate-category-filter') {
    props = configureCategoriesFilter(props, strings, categoriesValues, handleApplyCategoriesFilter);
  } else if (componentId === 'generate-created-date-filter' || componentId === 'generate-updated-date-filter') {
    props = configureDateFilter(
      props,
      dateFilters,
      dateFilterValues,
      handleApplyDateRangeFilter,
      componentId === 'generate-created-date-filter' ? 'createdAt' : 'updatedAt',
    );
  }

  return props;
};

const getFilterComponent = (componentId: string): React.ComponentType<any> | undefined => {
  return FilterComponentRegistry.get(componentId);
};

export { FilterComponentRegistry, getFilterComponent };
