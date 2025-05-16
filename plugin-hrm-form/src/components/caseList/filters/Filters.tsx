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

/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion, CaseFilterPosition } from 'hrm-form-definitions';
import FilterList from '@material-ui/icons/FilterList';
import DateRange from '@material-ui/icons/DateRange';
import { useSelector, useDispatch } from 'react-redux';

import { FiltersContainer, FiltersResetAll, MainTitle, CountText, FilterTitle } from '../../../styles';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import DateRangeFilter from './DateRangeFilter';
import { DateFilter, dateFilterOptionsInPast, dateFilterOptionsInPastAndFuture } from './dateFilters';
import { RootState } from '../../../states';
import * as CaseListSettingsActions from '../../../states/caseList/settings';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import { canOnlyViewOwnCases } from '../../../permissions';
import { caseListBase, configurationBase, namespace } from '../../../states/storeNamespaces';
import { DateFilterValue } from '../../../states/caseList/dateFilters';
import { getFilterComponent } from './CaseListFilterProvider';
import { CounselorHash } from '../../../types/types';

/**
 * Reads the definition version and returns and array of items (type Item[])
 * to be used as the options for the status filter
 * @param definitionVersion DefinitionVersion
 * @returns Item[]
 */
const getStatusInitialValue = (definitionVersion: DefinitionVersion) =>
  definitionVersion
    ? Object.values(definitionVersion.caseStatus).map(caseStatus => ({
        value: caseStatus.value,
        label: caseStatus.label,
        checked: false,
      }))
    : [];

/**
 * Reads the counselors hash and returns and array of items (type Item[])
 * to be used as the options for the counselors filter
 * @param counselorsHash CounselorHash
 * @returns Item[]
 */
const getCounselorsInitialValue = (counselorsHash: CounselorHash) =>
  Object.keys(counselorsHash).map(key => ({
    value: key,
    label: counselorsHash[key],
    checked: false,
  }));

/**
 * Reads the CaseOverview fields in definition version and returns an array of items (type Item[])
 * to be used as the options for the custom filter
 * @param definitionVersion DefinitionVersion
 * @param filterName The name of the filter to get values for
 * @returns Item[]
 */
const getCustomFilterInitialValue = (definitionVersion: DefinitionVersion, filterName: string) => {
  if (!definitionVersion) return [];

  const customFilterField = Object.values(definitionVersion.caseOverview).find(
    field => field && typeof field === 'object' && (field as { name: string }).name === filterName,
  ) as { options?: Array<{ value: string; label: string }> } | undefined;

  if (!customFilterField?.options) return [];

  return customFilterField.options
    .filter(option => option && option.value !== '')
    .map(option => ({
      value: String(option.value),
      label: String(option.label),
      checked: false,
    }));
};

/**
 * Creates and returns an array of date filters based on the case info filters
 * @param caseInfoFilters Record of case info filters
 * @returns DateFilter[]
 */
const getInitialDateFilters = (caseInfoFilters?: Record<string, any>): DateFilter[] => {
  const standardFilters = [
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
  ];

  const customDateFilters: DateFilter[] = [];

  if (caseInfoFilters) {
    Object.keys(caseInfoFilters).forEach(filterName => {
      if (filterName === 'createdAt' || filterName === 'updatedAt') {
        return;
      }

      const filterConfig = caseInfoFilters[filterName];
      if (filterConfig?.type === 'date-input') {
        customDateFilters.push({
          labelKey: filterConfig.label || filterName,
          filterPayloadParameter: filterName,
          options: filterConfig.allowFutureDates
            ? dateFilterOptionsInPastAndFuture(filterConfig.label || filterName)
            : dateFilterOptionsInPast(),
        });
      }
    });
  }

  return [...standardFilters, ...customDateFilters];
};

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

type OwnProps = {
  currentDefinitionVersion?: DefinitionVersion;
  caseCount: number;
};

type FilterState = {
  statusValues: Item[];
  counselorValues: Item[];
  dateFilterValues: {
    createdAt?: DateFilterValue;
    updatedAt?: DateFilterValue;
  };
  caseInfoFilterValues: Record<string, Item[]>;
  openedFilter?: string;
};

const Filters: React.FC<OwnProps> = ({ currentDefinitionVersion, caseCount }) => {
  const dispatch = useDispatch();

  const currentFilter = useSelector((state: RootState) => state[namespace][caseListBase].currentSettings.filter);
  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);
  const caseFilterDefinition = currentDefinitionVersion?.caseFilters;

  const strings = getTemplateStrings();
  const featureFlags = getAseloFeatureFlags();
  const { helpline } = getHrmConfig();
  const canViewCounselorFilter = !canOnlyViewOwnCases();

  const [filterState, setFilterState] = useState<FilterState>({
    openedFilter: undefined,
    statusValues: getStatusInitialValue(currentDefinitionVersion),
    counselorValues: getCounselorsInitialValue(counselorsHash),
    dateFilterValues: {},
    caseInfoFilterValues: Object.keys(caseFilterDefinition || {}).reduce(
      (acc, filterName) => ({
        ...acc,
        [filterName]: getCustomFilterInitialValue(currentDefinitionVersion, filterName),
      }),
      {},
    ),
  });

  const handleSetOpenedFilter = useCallback((filterName?: string) => {
    setFilterState(prev => ({ ...prev, openedFilter: filterName }));
  }, []);

  const handleApplyStatusFilter = useCallback(
    (values: Item[]) => {
      dispatch(CaseListSettingsActions.updateCaseListFilter({ statuses: filterCheckedItems(values) }));
    },
    [dispatch],
  );

  const handleApplyCounselorFilter = useCallback(
    (values: Item[]) => {
      dispatch(CaseListSettingsActions.updateCaseListFilter({ counsellors: filterCheckedItems(values) }));
    },
    [dispatch],
  );

  const handleApplyDateRangeFilter = useCallback(
    (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => {
      if (caseFilterDefinition && Object.keys(caseFilterDefinition).includes(filter.filterPayloadParameter)) {
        dispatch(
          CaseListSettingsActions.updateCaseListFilter({
            caseInfoFilters: {
              ...currentFilter.caseInfoFilters,
              [filter.filterPayloadParameter]: filterValue,
            },
          }),
        );
      } else {
        dispatch(
          CaseListSettingsActions.updateCaseListFilter({
            [filter.filterPayloadParameter]: filterValue,
          }),
        );
      }
    },
    [dispatch, currentFilter, caseFilterDefinition],
  );

  const handleApplyCustomFilter = useCallback(
    (filterName: string) => (values: Item[]) => {
      dispatch(
        CaseListSettingsActions.updateCaseListFilter({
          caseInfoFilters: {
            ...currentFilter.caseInfoFilters,
            [filterName]: filterCheckedItems(values),
          },
        }),
      );
    },
    [dispatch, currentFilter],
  );

  const handleClearFilters = useCallback(() => {
    dispatch(CaseListSettingsActions.clearCaseListFilter());
  }, [dispatch]);

  const getCasesCountString = () =>
    caseCount === 1 ? 'CaseList-Filters-CaseCount-Singular' : 'CaseList-Filters-CaseCount-Plural';

  const hasFiltersApplied = useMemo(() => {
    if (!currentFilter?.caseInfoFilters) return false;

    const statusFiltersApplied = filterCheckedItems(filterState.statusValues).length > 0;
    const counselorFiltersApplied = filterCheckedItems(filterState.counselorValues).length > 0;
    const dateFiltersApplied = Boolean(Object.values(filterState.dateFilterValues).filter(dfv => dfv).length);
    const customFiltersApplied =
      currentFilter.caseInfoFilters &&
      Object.values(currentFilter.caseInfoFilters).some(
        values => values && (Array.isArray(values) ? values.length > 0 : true),
      );

    return statusFiltersApplied || counselorFiltersApplied || dateFiltersApplied || customFiltersApplied;
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filterState.statusValues,
    filterState.counselorValues,
    filterState.dateFilterValues,
    currentFilter?.caseInfoFilters,
  ]);

  useEffect(() => {
    setFilterState(prevState => ({
      ...prevState,
      statusValues: getStatusInitialValue(currentDefinitionVersion),
      caseInfoFilterValues: Object.keys(caseFilterDefinition || {}).reduce(
        (acc, filterName) => ({
          ...acc,
          [filterName]: getCustomFilterInitialValue(currentDefinitionVersion, filterName),
        }),
        {},
      ),
    }));
  }, [currentDefinitionVersion, helpline, caseFilterDefinition]);

  useEffect(() => {
    if (!currentFilter) return;

    const { counsellors, statuses, categories, caseInfoFilters, includeOrphans, ...currentDateFilters } = currentFilter;

    const newCounselorValues = getCounselorsInitialValue(counselorsHash).map(cv => ({
      ...cv,
      checked: counsellors.includes(cv.value),
    }));

    const newStatusValues = filterState.statusValues.map(sv => ({
      ...sv,
      checked: statuses.includes(sv.value),
    }));

    const newCaseInfoFilterValues = Object.keys(caseFilterDefinition || {})
      .filter(filterName => caseFilterDefinition?.[filterName]?.type === 'multi-select')
      .reduce(
        (acc, filterName) => ({
          ...acc,
          [filterName]: filterState.caseInfoFilterValues[filterName].map(option => ({
            ...option,
            checked: Array.isArray(caseInfoFilters?.[filterName])
              ? (caseInfoFilters?.[filterName] as string[]).includes(option.value) || false
              : false,
          })),
        }),
        filterState.caseInfoFilterValues,
      );

    const newDateFilters = { ...currentDateFilters };

    Object.keys(caseFilterDefinition || {})
      .filter(filterName => caseFilterDefinition?.[filterName]?.type === 'date-input')
      .forEach(filterName => {
        if (caseInfoFilters?.[filterName] && typeof caseInfoFilters[filterName] === 'object') {
          newDateFilters[filterName] = caseInfoFilters[filterName] as DateFilterValue;
        }
      });

    setFilterState(prevState => ({
      ...prevState,
      counselorValues: newCounselorValues,
      statusValues: newStatusValues,
      dateFilterValues: newDateFilters,
      caseInfoFilterValues: newCaseInfoFilterValues,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, counselorsHash, caseFilterDefinition]);

  if (!currentDefinitionVersion) return null;

  const renderRegisteredComponents = (filterName: string, position: CaseFilterPosition) => {
    const filter = caseFilterDefinition?.[filterName];

    if (!filter || filter.position !== position || !filter.component) return null;

    if (filter.component === 'generate-counselor-filter' && !canViewCounselorFilter) {
      return null;
    }

    const componentId = filter.component;

    const baseProps = {
      key: filterName,
      name: filterName,
      openedFilter: filterState.openedFilter,
      setOpenedFilter: handleSetOpenedFilter,
    };

    const filterData = {
      strings,
      statusValues: filterState.statusValues,
      counselorValues: filterState.counselorValues,
      dateFilterValues: filterState.dateFilterValues,
      dateFilters: getInitialDateFilters(caseFilterDefinition),
      handleApplyStatusFilter,
      handleApplyCounselorFilter,
      handleApplyDateRangeFilter,
    };

    const configuredComponent = getFilterComponent(componentId, baseProps, filterData);

    if (!configuredComponent) {
      console.warn(`Filter component ${componentId} not found for filter ${filterName}`);
      return null;
    }

    return configuredComponent;
  };

  const renderMultiSelectFilters = (filterName: string, position: CaseFilterPosition) => {
    const filter = caseFilterDefinition?.[filterName];

    if (!filter || filter.position !== position || filter.type !== 'multi-select') return null;

    // Check if the filterName exists in caseOverview fields
    const caseOverviewKey = Object.keys(currentDefinitionVersion.caseOverview).find(
      key => currentDefinitionVersion.caseOverview[key].name === filterName,
    );
    if (!caseOverviewKey) return null;

    return (
      <MultiSelectFilter
        key={filterName}
        name={filterName}
        textCode={currentDefinitionVersion?.caseOverview[caseOverviewKey]?.label || filterName}
        defaultValues={filterState.caseInfoFilterValues[filterName]}
        openedFilter={filterState.openedFilter}
        applyFilter={handleApplyCustomFilter(filterName)}
        setOpenedFilter={handleSetOpenedFilter}
        searchable={filter.searchable}
      />
    );
  };

  const renderDateInputFilters = (filterName: string, position: CaseFilterPosition) => {
    const filter = caseFilterDefinition?.[filterName];

    if (!filter || filter.position !== position || filter.type !== 'date-input') return null;

    // Check if the filterName exists in caseOverview fields
    const caseOverviewKey = Object.keys(currentDefinitionVersion.caseOverview).find(
      key => currentDefinitionVersion.caseOverview[key].name === filterName,
    );
    if (!caseOverviewKey) return null;

    const filterForm = currentDefinitionVersion?.caseOverview[caseOverviewKey];

    const dateFilter: DateFilter = {
      labelKey: filterForm?.label || filterName,
      filterPayloadParameter: filterName,
      options: dateFilterOptionsInPastAndFuture(filterForm?.label || filterName),
    };

    return (
      <DateRangeFilter
        key={filterName}
        name={filterName}
        allowFutureDates={filter.allowFutureDates}
        labelKey={filterForm?.label || filterName}
        options={dateFilter.options}
        current={currentFilter.caseInfoFilters?.[filterName] as DateFilterValue}
        openedFilter={filterState.openedFilter}
        applyFilter={handleApplyDateRangeFilter(dateFilter)}
        setOpenedFilter={handleSetOpenedFilter}
      />
    );
  };

  const renderFiltersByPosition = (position: CaseFilterPosition) => {
    return Object.keys(caseFilterDefinition || {})
      .filter(filterName => caseFilterDefinition?.[filterName]?.position === position)
      .map(filterName => {
        const filter = caseFilterDefinition?.[filterName];

        if (filter.component) {
          return renderRegisteredComponents(filterName, position);
        } else if (filter.type === 'multi-select') {
          return renderMultiSelectFilters(filterName, position);
        } else if (filter.type === 'date-input') {
          return renderDateInputFilters(filterName, position);
        }

        return null;
      });
  };

  const hasFiltersOnRight = Object.keys(caseFilterDefinition || {}).some(
    filterName => caseFilterDefinition?.[filterName]?.position === 'right',
  );

  return (
    <>
      <FiltersContainer id="CaseList-Cases-label">
        <MainTitle>
          <Template code="CaseList-Cases" />
        </MainTitle>
        {hasFiltersApplied && (
          <FiltersResetAll type="button" onClick={handleClearFilters}>
            <Template code="CaseList-Filters-ResetAllFilters" />
          </FiltersResetAll>
        )}
        <CountText>
          <Template code={getCasesCountString()} count={caseCount} />
        </CountText>
      </FiltersContainer>
      <FiltersContainer data-testid="CaseList-Filters-Panel">
        <FilterList fontSize="small" />
        <FilterTitle>
          <Template code="Table-FilterBy" />
        </FilterTitle>

        <div style={{ display: 'inline-flex' }}>{renderFiltersByPosition('left')}</div>

        {hasFiltersOnRight && (
          <div style={{ display: 'inline-flex', marginLeft: 'auto' }}>
            <DateRange fontSize="small" style={{ marginTop: '4px' }} />
            <FilterTitle style={{ margin: '5px 10px 0 6px' }}>
              <Template code="CaseList-Filters-DateFiltersLabel" />
            </FilterTitle>
            {renderFiltersByPosition('right')}
          </div>
        )}
      </FiltersContainer>
    </>
  );
};

Filters.displayName = 'Filters';

export default Filters;
