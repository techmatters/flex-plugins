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
import { CategoryFilter, CounselorHash } from '../../../types/types';
import DateRangeFilter from './DateRangeFilter';
import { DateFilter, dateFilterOptionsInPastAndFuture, dateFilterOptionsInPast } from './dateFilters';
import CategoriesFilter, { Category } from './CategoriesFilter';
import { RootState } from '../../../states';
import * as CaseListSettingsActions from '../../../states/caseList/settings';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import { canOnlyViewOwnCases } from '../../../permissions';
import { caseListBase, configurationBase, namespace } from '../../../states/storeNamespaces';
import { DateFilterValue } from '../../../states/caseList/dateFilters';

const CASEINFO_FILTERS: Record<
  string,
  {
    searchable?: boolean;
    type:
      | 'multi-select'
      | 'select'
      | 'date-input'
      | 'checkbox'
      | 'textarea'
      | 'text-input'
      | 'number-input'
      | 'boolean-input'
      | 'radio-input'
      | 'file-input';
    allowFutureDates?: boolean;
  }
> = {
  operatingArea: { searchable: true, type: 'multi-select' },
  priority: { searchable: true, type: 'select' },
  reportDate: { type: 'date-input', allowFutureDates: true },
  childIsAtRisk: { type: 'checkbox' },
};

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

const getInitialDateFilters = (): DateFilter[] => [
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
  {
    labelKey: 'CaseList-Filters-DateFilter-FollowUpDate',
    filterPayloadParameter: 'followUpDate',
    options: dateFilterOptionsInPastAndFuture(),
  },
];
/**
 * Reads the definition version and returns and array of categories (type Category[])
 * to be used as the options for the categories filter
 */
const getCategoriesInitialValue = (definitionVersion: DefinitionVersion, helpline: string) =>
  definitionVersion
    ? Object.entries(definitionVersion.tabbedForms.IssueCategorizationTab(helpline)).map(
        ([categoryName, { subcategories }]) => ({
          categoryName,
          subcategories: subcategories.map(subcategory => ({
            value: subcategory.label,
            label: subcategory.label,
            checked: false,
          })),
        }),
      )
    : [];

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

/**
 * Convert an array of categories (type Category[]) into an array of CategoryFilter.
 * This array will contain only the categories that are checked.
 * @param categories Category[]
 * @returns CategoryFilter[]
 */
const filterCheckedCategories = (categories: Category[]): CategoryFilter[] =>
  categories.flatMap(category =>
    category.subcategories
      .filter(subcategory => subcategory.checked)
      .map(subcategory => ({
        category: category.categoryName,
        subcategory: subcategory.label,
      })),
  );

/**
 * Given the selected categories from redux and the previous categoriesValues,
 * it returns the updated values for categoriesValues, whith the correct checked values.
 *
 * @param categories Selected categories from redux (type CategoryFilter[])
 * @param categoriesValues Previous categoriesValues (type Category[])
 * @returns
 */
const getUpdatedCategoriesValues = (categories: CategoryFilter[], categoriesValues: Category[]): Category[] => {
  const isChecked = (categoryName: string, subcategoryName: string) =>
    categories.some(c => c.category === categoryName && c.subcategory === subcategoryName);

  return categoriesValues.map(categoryValue => ({
    ...categoryValue,
    subcategories: categoryValue.subcategories.map(subcategory => ({
      ...subcategory,
      checked: isChecked(categoryValue.categoryName, subcategory.label),
    })),
  }));
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
    followUpDate?: DateFilterValue;
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

  // Updates UI state from current filters
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

    // Update date filter values with any custom date filters from caseInfoFilters
    Object.keys(CASEINFO_FILTERS)
      .filter(filterName => CASEINFO_FILTERS[filterName].type === 'date-input')
      .forEach(filterName => {
        // Store custom date filters only in dateFilterValues for UI display purposes
        // They will be sent back to caseInfoFilters when applied
        if (caseInfoFilters?.[filterName] && typeof caseInfoFilters[filterName] === 'object') {
          currentDateFilters[filterName] = caseInfoFilters[filterName] as DateFilterValue;
        }
      });

    setCounselorValues(newCounselorValues);
    setStatusValues(newStatusValues);
    setDateFilterValues(currentDateFilters);
    setCategoriesValues(newCategoriesValues);
    setCaseInfoFilterValues(newCaseInfoFilterValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterCompare, counselorsHashCompare]);

  if (!currentDefinitionVersion) return null;

  const handleApplyStatusFilter = (values: Item[]) => {
    updateCaseListFilter({ statuses: filterCheckedItems(values) });
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    updateCaseListFilter({ counsellors: filterCheckedItems(values) });
  };

  const handleApplyDateRangeFilter = (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => {
    // Check if this is a standard date filter or a custom date filter from CASEINFO_FILTERS
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

          {/* Status Filter */}
          <MultiSelectFilter
            name="status"
            text={strings['CaseList-Filters-Status']}
            defaultValues={statusValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyStatusFilter}
            setOpenedFilter={setOpenedFilter}
          />

          {/* Counselor Filter */}
          {canViewCounselorFilter && (
            <MultiSelectFilter
              name="counselor"
              searchDescription={strings['CaseList-Filters-SearchForCounselor']}
              text={strings['CaseList-Filters-Counselor']}
              defaultValues={counselorValues}
              openedFilter={openedFilter}
              applyFilter={handleApplyCounselorFilter}
              setOpenedFilter={setOpenedFilter}
              searchable
            />
          )}

          {/* Categories Filter */}
          <CategoriesFilter
            name="categories"
            searchDescription={strings['CaseList-Filters-SearchByCategory']}
            text={strings['CaseList-Filters-Categories']}
            defaultValues={categoriesValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyCategoriesFilter}
            setOpenedFilter={setOpenedFilter}
            searchable
          />

          {/* Multi-Select Filters */}
          {Object.keys(CASEINFO_FILTERS)
            .filter(filterName => CASEINFO_FILTERS[filterName].type === 'multi-select')
            .map(filterName => (
              <MultiSelectFilter
                key={filterName}
                name={filterName}
                text={
                  currentDefinitionVersion?.caseOverview[
                    Object.keys(currentDefinitionVersion.caseOverview).find(
                      key => currentDefinitionVersion.caseOverview[key].name === filterName,
                    )
                  ].label
                }
                defaultValues={caseInfoFilterValues[filterName]}
                openedFilter={openedFilter}
                applyFilter={handleApplyCustomFilter(filterName)}
                setOpenedFilter={setOpenedFilter}
                searchable
              />
            ))}

          <div style={{ display: 'inline-flex', marginLeft: 'auto' }}>
            <DateRange fontSize="small" style={{ marginTop: '4px' }} />
            <FilterTitle style={{ margin: '5px 10px 0 6px' }}>
              <Template code="CaseList-Filters-DateFiltersLabel" />
            </FilterTitle>
            {/* Date Filters */}
            {getInitialDateFilters().map(df => {
              console.log('>>> Date Filter', df);
              return (
                <DateRangeFilter
                  name={`${df.filterPayloadParameter}Filter`}
                  allowFutureDates={df.filterPayloadParameter === 'followUpDate'}
                  labelKey={df.labelKey}
                  options={df.options}
                  current={dateFilterValues[df.filterPayloadParameter]}
                  openedFilter={openedFilter}
                  applyFilter={handleApplyDateRangeFilter(df)}
                  setOpenedFilter={setOpenedFilter}
                  key={df.filterPayloadParameter}
                />
              );
            })}

            {Object.keys(CASEINFO_FILTERS)
              .filter(filterName => CASEINFO_FILTERS[filterName].type === 'date-input')
              .map(filterName => {
                const filter = CASEINFO_FILTERS[filterName];
                const filterForm = currentDefinitionVersion?.caseOverview[filterName];
                console.log('>>> Custom Date Filter', filterForm, filterName, filter);

                const dateFilter: DateFilter = {
                  labelKey: filterForm?.label || filterName,
                  filterPayloadParameter: filterName,
                  options: dateFilterOptionsInPastAndFuture(),
                };

                return (
                  <DateRangeFilter
                    name={filterName}
                    allowFutureDates={filter.allowFutureDates}
                    labelKey={filterForm?.label}
                    options={dateFilterOptionsInPastAndFuture()}
                    current={currentFilter.caseInfoFilters?.[filterName] as DateFilterValue}
                    openedFilter={openedFilter}
                    applyFilter={handleApplyDateRangeFilter(dateFilter)}
                    setOpenedFilter={setOpenedFilter}
                    key={filterName}
                  />
                );
              })}
          </div>
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
