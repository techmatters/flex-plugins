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
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';
import FilterList from '@material-ui/icons/FilterList';
import DateRange from '@material-ui/icons/DateRange';
import { connect, ConnectedProps } from 'react-redux';

import { FiltersContainer, FiltersResetAll, MainTitle, CountText, FilterTitle } from '../../../styles';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import DateRangeFilter from './DateRangeFilter';
import { DateFilter, dateFilterOptionsInPastAndFuture, dateFilterOptionsInPast, isDivider } from './dateFilters';
import { Category } from './CategoriesFilter';
import { RootState } from '../../../states';
import * as CaseListSettingsActions from '../../../states/caseList/settings';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import { canOnlyViewOwnCases } from '../../../permissions';
import { caseListBase, configurationBase, namespace } from '../../../states/storeNamespaces';
import { DateFilterValue, DateExistsCondition } from '../../../states/caseList/dateFilters';
import { getFilterComponent, getFilterComponentProps } from './FilterComponentsRegistry';
import {
  getStatusInitialValue,
  getCounselorsInitialValue,
  getCustomFilterInitialValue,
  getInitialDateFilters,
  getCategoriesInitialValue,
  filterCheckedItems,
  filterCheckedCategories,
  getUpdatedCategoriesValues,
} from './filterUtils';

const CASEINFO_FILTERS: Record<
  string,
  {
    searchable?: boolean;
    type?:
      | 'multi-select'
      // | 'select'
      | 'date-input';
    // | 'checkbox'
    // | 'textarea'
    // | 'text-input'
    // | 'number-input'
    // | 'boolean-input'
    // | 'radio-input'
    // | 'file-input';
    allowFutureDates?: boolean;
    component?: string;
    position: 'left' | 'right';
  }
> = {
  status: { component: 'generate-status-filter', position: 'left' },
  counselor: { component: 'generate-counselor-filter', position: 'left' },
  category: { component: 'generate-category-filter', position: 'left' },
  operatingArea: { searchable: true, type: 'multi-select', position: 'left' },
  // priority: { searchable: true, type: 'multi-select', position: 'left' },
  createdDate: { component: 'generate-created-date-filter', position: 'right' },
  updatedDate: { component: 'generate-updated-date-filter', position: 'right' },
  followUpDate: { type: 'date-input', allowFutureDates: true, position: 'right' },
  // reportDate: { type: 'date-input', allowFutureDates: true, position: 'right' },
};

type OwnProps = {
  currentDefinitionVersion?: DefinitionVersion;
  caseCount: number;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Filters: React.FC<Props> = ({
  currentDefinitionVersion,
  currentFilter,
  currentFilterCompare,
  counselorsHash,
  counselorsHashCompare,
  caseCount,
  updateCaseListFilter,
  clearCaseListFilter,
}) => {
  const strings = getTemplateStrings();
  const featureFlags = getAseloFeatureFlags();
  const { helpline } = getHrmConfig();

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState<Item[]>(getStatusInitialValue(currentDefinitionVersion));
  const [counselorValues, setCounselorValues] = useState<Item[]>(getCounselorsInitialValue(counselorsHash));
  const [dateFilterValues, setDateFilterValues] = useState<{
    createdAt?: DateFilterValue;
    updatedAt?: DateFilterValue;
  }>({});
  const [categoriesValues, setCategoriesValues] = useState<Category[]>(
    getCategoriesInitialValue(currentDefinitionVersion, helpline),
  );
  const [caseInfoFilterValues, setCaseInfoFilterValues] = useState<Record<string, Item[]>>(
    Object.keys(CASEINFO_FILTERS).reduce(
      (acc, filterName) => ({
        ...acc,
        [filterName]: getCustomFilterInitialValue(currentDefinitionVersion, filterName),
      }),
      {},
    ),
  );

  useEffect(() => {
    setStatusValues(getStatusInitialValue(currentDefinitionVersion));
    setCategoriesValues(getCategoriesInitialValue(currentDefinitionVersion, helpline));
    setCaseInfoFilterValues(
      Object.keys(CASEINFO_FILTERS).reduce(
        (acc, filterName) => ({
          ...acc,
          [filterName]: getCustomFilterInitialValue(currentDefinitionVersion, filterName),
        }),
        {},
      ),
    );
  }, [currentDefinitionVersion, helpline]);

  useEffect(() => {
    const { counsellors, statuses, categories, caseInfoFilters, includeOrphans, ...currentDateFilters } = currentFilter;
    const newCounselorValues = getCounselorsInitialValue(counselorsHash).map(cv => ({
      ...cv,
      checked: counsellors.includes(cv.value),
    }));
    const newStatusValues = statusValues.map(sv => ({ ...sv, checked: statuses.includes(sv.value) }));
    const newCategoriesValues = getUpdatedCategoriesValues(categories, categoriesValues);
    const newCaseInfoFilterValues = Object.keys(CASEINFO_FILTERS)
      .filter(filterName => CASEINFO_FILTERS[filterName].type === 'multi-select')
      .reduce(
        (acc, filterName) => ({
          ...acc,
          [filterName]: caseInfoFilterValues[filterName].map(option => ({
            ...option,
            checked: Array.isArray(caseInfoFilters?.[filterName])
              ? (caseInfoFilters?.[filterName] as string[]).includes(option.value) || false
              : false,
          })),
        }),
        {},
      );

    Object.keys(CASEINFO_FILTERS)
      .filter(filterName => CASEINFO_FILTERS[filterName].type === 'date-input')
      .forEach(filterName => {
        if (caseInfoFilters?.[filterName] && typeof caseInfoFilters[filterName] === 'object') {
          currentDateFilters[filterName] = caseInfoFilters[filterName] as DateFilterValue;
        }
      });

    setCounselorValues(newCounselorValues);
    setStatusValues(newStatusValues);
    setDateFilterValues(currentDateFilters);
    setCategoriesValues(newCategoriesValues);
    setCaseInfoFilterValues(newCaseInfoFilterValues);
  }, [
    currentFilterCompare,
    counselorsHashCompare,
    caseInfoFilterValues,
    categoriesValues,
    counselorsHash,
    currentFilter,
    statusValues,
  ]);

  if (!currentDefinitionVersion) return null;

  const handleApplyStatusFilter = (values: Item[]) => {
    updateCaseListFilter({ statuses: filterCheckedItems(values) });
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    updateCaseListFilter({ counsellors: filterCheckedItems(values) });
  };

  const handleApplyDateRangeFilter = (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => {
    if (Object.keys(CASEINFO_FILTERS).includes(filter.filterPayloadParameter)) {
      updateCaseListFilter({
        caseInfoFilters: {
          ...currentFilter.caseInfoFilters,
          [filter.filterPayloadParameter]: filterValue,
        },
        // [filter.filterPayloadParameter]: undefined,
      });
    } else {
      updateCaseListFilter({
        [filter.filterPayloadParameter]: filterValue,
      });
    }
  };

  const handleApplyCategoriesFilter = (values: Category[]) => {
    updateCaseListFilter({ categories: filterCheckedCategories(values) });
  };

  const handleApplyCustomFilter = (filterName: string) => (values: Item[]) => {
    updateCaseListFilter({
      caseInfoFilters: {
        ...currentFilter.caseInfoFilters,
        [filterName]: filterCheckedItems(values),
      },
    });
  };

  const handleClearFilters = () => {
    clearCaseListFilter();
  };

  const getCasesCountString = () =>
    caseCount === 1 ? 'CaseList-Filters-CaseCount-Singular' : 'CaseList-Filters-CaseCount-Plural';

  const hasFiltersApplied =
    filterCheckedItems(statusValues).length > 0 ||
    filterCheckedItems(counselorValues).length > 0 ||
    Boolean(Object.values(dateFilterValues).filter(dfv => dfv).length) ||
    filterCheckedCategories(categoriesValues).length > 0 ||
    (currentFilter.caseInfoFilters &&
      Object.values(currentFilter.caseInfoFilters).some(
        values => values && (Array.isArray(values) ? values.length > 0 : true),
      ));

  const canViewCounselorFilter = !canOnlyViewOwnCases();

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
      {featureFlags.enable_filter_cases && (
        <FiltersContainer data-testid="CaseList-Filters-Panel">
          <FilterList fontSize="small" />
          <FilterTitle>
            <Template code="Table-FilterBy" />
          </FilterTitle>

          <div style={{ display: 'inline-flex' }}>
            {Object.keys(CASEINFO_FILTERS)
              .filter(filterName => CASEINFO_FILTERS[filterName].position === 'left')
              .map(filterName => {
                const filter = CASEINFO_FILTERS[filterName];

                if (filter.component === 'generate-counselor-filter' && !canViewCounselorFilter) {
                  return null;
                }

                if (filter.component) {
                  const componentId = filter.component as string;
                  const FilterComponent = getFilterComponent(componentId);

                  if (!FilterComponent) {
                    console.warn(`Filter component ${componentId} not found in registry for filter ${filterName}`);
                    return null;
                  }

                  const baseProps = {
                    key: filterName,
                    name: filterName,
                    openedFilter,
                    setOpenedFilter,
                  };

                  const filterData = {
                    strings,
                    statusValues,
                    counselorValues,
                    categoriesValues,
                    dateFilterValues,
                    dateFilters: getInitialDateFilters(CASEINFO_FILTERS),
                    handleApplyStatusFilter,
                    handleApplyCounselorFilter,
                    handleApplyCategoriesFilter,
                    handleApplyDateRangeFilter,
                  };

                  const props = getFilterComponentProps(componentId, filterName, baseProps, filterData);

                  return <FilterComponent key={filterName} {...props} />;
                } else if (filter.type === 'multi-select') {
                  return (
                    <MultiSelectFilter
                      key={filterName}
                      name={filterName}
                      text={
                        currentDefinitionVersion?.caseOverview[
                          Object.keys(currentDefinitionVersion.caseOverview).find(
                            key => currentDefinitionVersion.caseOverview[key].name === filterName,
                          )
                        ]?.label || filterName
                      }
                      defaultValues={caseInfoFilterValues[filterName]}
                      openedFilter={openedFilter}
                      applyFilter={handleApplyCustomFilter(filterName)}
                      setOpenedFilter={setOpenedFilter}
                      searchable={filter.searchable}
                    />
                  );
                } else if (filter.type === 'date-input') {
                  const filterForm = currentDefinitionVersion?.caseOverview[filterName];

                  const dateFilter: DateFilter = {
                    labelKey: filterName === 'reportDate' ? 'Case.ReportDate' : filterForm?.label || filterName,
                    filterPayloadParameter: filterName,
                    options:
                      filterName === 'reportDate'
                        ? [
                            ...dateFilterOptionsInPastAndFuture().filter(
                              option => !isDivider(option) && option[0] !== 'withoutDate',
                            ),
                            [
                              'withoutDate',
                              { titleKey: 'Case.NoReportDate', exists: DateExistsCondition.MUST_NOT_EXIST },
                            ],
                          ]
                        : filter.allowFutureDates
                        ? dateFilterOptionsInPastAndFuture()
                        : dateFilterOptionsInPast(),
                  };

                  return (
                    <DateRangeFilter
                      key={filterName}
                      name={filterName}
                      allowFutureDates={filter.allowFutureDates}
                      labelKey={filterName === 'reportDate' ? 'Case.ReportDate' : filterForm?.label || filterName}
                      options={dateFilter.options}
                      current={currentFilter.caseInfoFilters?.[filterName] as DateFilterValue}
                      openedFilter={openedFilter}
                      applyFilter={handleApplyDateRangeFilter(dateFilter)}
                      setOpenedFilter={setOpenedFilter}
                    />
                  );
                }

                return null;
              })}
          </div>

          {Object.keys(CASEINFO_FILTERS).some(filterName => CASEINFO_FILTERS[filterName].position === 'right') && (
            <div style={{ display: 'inline-flex', marginLeft: 'auto' }}>
              <DateRange fontSize="small" style={{ marginTop: '4px' }} />
              <FilterTitle style={{ margin: '5px 10px 0 6px' }}>
                <Template code="CaseList-Filters-DateFiltersLabel" />
              </FilterTitle>

              {Object.keys(CASEINFO_FILTERS)
                .filter(filterName => CASEINFO_FILTERS[filterName].position === 'right')
                .map(filterName => {
                  const filter = CASEINFO_FILTERS[filterName];

                  if (filter.component) {
                    const componentId = filter.component as string;
                    const FilterComponent = getFilterComponent(componentId);

                    if (!FilterComponent) {
                      console.warn(`Filter component ${componentId} not found in registry for filter ${filterName}`);
                      return null;
                    }

                    const baseProps = {
                      key: filterName,
                      name: filterName,
                      openedFilter,
                      setOpenedFilter,
                    };

                    const filterData = {
                      strings,
                      statusValues,
                      counselorValues,
                      categoriesValues,
                      dateFilterValues,
                      dateFilters: getInitialDateFilters(CASEINFO_FILTERS),
                      handleApplyStatusFilter,
                      handleApplyCounselorFilter,
                      handleApplyCategoriesFilter,
                      handleApplyDateRangeFilter,
                    };

                    const props = getFilterComponentProps(componentId, filterName, baseProps, filterData);

                    return <FilterComponent key={filterName} {...props} />;
                  } else if (filter.type === 'date-input') {
                    const filterForm = currentDefinitionVersion?.caseOverview[filterName];

                    const dateFilter: DateFilter = {
                      labelKey: filterName === 'reportDate' ? 'Case.ReportDate' : filterForm?.label || filterName,
                      filterPayloadParameter: filterName,
                      options:
                        filterName === 'reportDate'
                          ? [
                              ...dateFilterOptionsInPastAndFuture().filter(
                                option => !isDivider(option) && option[0] !== 'withoutDate',
                              ),
                              [
                                'withoutDate',
                                { titleKey: 'Case.NoReportDate', exists: DateExistsCondition.MUST_NOT_EXIST },
                              ],
                            ]
                          : dateFilterOptionsInPastAndFuture(),
                    };

                    return (
                      <DateRangeFilter
                        key={filterName}
                        name={filterName}
                        allowFutureDates={filter.allowFutureDates}
                        labelKey={filterName === 'reportDate' ? 'Case.ReportDate' : filterForm?.label || filterName}
                        options={dateFilter.options}
                        current={currentFilter.caseInfoFilters?.[filterName] as DateFilterValue}
                        openedFilter={openedFilter}
                        applyFilter={handleApplyDateRangeFilter(dateFilter)}
                        setOpenedFilter={setOpenedFilter}
                      />
                    );
                  }

                  return null;
                })}
            </div>
          )}
        </FiltersContainer>
      )}
    </>
  );
};

Filters.displayName = 'Filters';

const mapDispatchToProps = {
  updateCaseListFilter: CaseListSettingsActions.updateCaseListFilter,
  clearCaseListFilter: CaseListSettingsActions.clearCaseListFilter,
};

const mapStateToProps = (state: RootState) => ({
  currentFilter: state[namespace][caseListBase].currentSettings.filter,
  currentFilterCompare: JSON.stringify(state[namespace][caseListBase].currentSettings.filter),
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  counselorsHashCompare: JSON.stringify(state[namespace][configurationBase].counselors.hash),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Filters);

export default connected;
