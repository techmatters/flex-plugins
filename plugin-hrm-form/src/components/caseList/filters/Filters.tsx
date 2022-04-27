/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';
import FilterList from '@material-ui/icons/FilterList';
import DateRange from '@material-ui/icons/DateRange';
import { connect, ConnectedProps } from 'react-redux';

import { getConfig } from '../../../HrmFormPlugin';
import { FiltersContainer, FiltersResetAll, CasesTitle, CasesCount, FilterBy } from '../../../styles/caseList/filters';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import { CounselorHash } from '../../../types/types';
import DateRangeFilter from './DateRangeFilter';
import {
  DateFilterOption,
  DateFilter,
  dateFilterPayloadFromFilters,
  followUpDateFilterOptions,
  standardCaseListDateFilterOptions,
  DateFilterValue,
} from './dateFilters';
import { caseListBase, namespace, RootState } from '../../../states';
import * as CaseListSettingsActions from '../../../states/caseList/settings';
/**
 * Reads the definition version and returns and array of items (type Item[])
 * to be used as the options for the status filter
 * @param definitionVersion DefinitionVersion
 * @returns Item[]
 */
const getStatusInitialValue = (definitionVersion: DefinitionVersion) =>
  Object.values(definitionVersion.caseStatus).map(caseStatus => ({
    value: caseStatus.value,
    label: caseStatus.label,
    checked: false,
  }));

/**
 * Reads the counselors hash and returns and array of items (type Item[])
 * to be used as the options for the counselors filter
 * @param counselorsHash CounselorHash
 * @returns Item[]
 */
const getCounselorsInitialValue = (counselorsHash: CounselorHash) =>
  Object.keys(counselorsHash).map(key => ({ value: key, label: counselorsHash[key], checked: false }));

const getInitialDateFilters = (): DateFilter[] => [
  {
    labelKey: 'CaseList-Filters-DateFilter-CreatedAt',
    filterPayloadParameter: 'createdAt',
    options: standardCaseListDateFilterOptions(),
  },
  {
    labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
    filterPayloadParameter: 'updatedAt',
    options: standardCaseListDateFilterOptions(),
  },
  {
    labelKey: 'CaseList-Filters-DateFilter-FollowUpDate',
    filterPayloadParameter: 'followUpDate',
    options: followUpDateFilterOptions(),
  },
];

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

type OwnProps = {
  currentDefinitionVersion: DefinitionVersion;
  counselorsHash: CounselorHash;
  caseCount: number;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Filters: React.FC<Props> = ({
  currentDefinitionVersion,
  currentFilter,
  currentFilterCompare,
  counselorsHash,
  caseCount,
  updateCaseListFilter,
  clearCaseListFilter,
}) => {
  const statusInitialValues = getStatusInitialValue(currentDefinitionVersion);

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState<Item[]>(statusInitialValues);
  const [counselorValues, setCounselorValues] = useState<Item[]>([]);
  const [dateFilterValues, setDateFilterValues] = useState<{
    createdAt?: DateFilterValue;
    updatedAt?: DateFilterValue;
    followUpDate?: DateFilterValue;
  }>({});
  const [uiFiltersComparable, setUIFilterComparable] = useState(
    JSON.stringify({ statusValues, counselorValues, dateFilterValues }),
  );

  // updates counselor options when counselorHash is updated
  useEffect(() => {
    const counselorInitialValues = getCounselorsInitialValue(counselorsHash);
    setCounselorValues(counselorInitialValues);
  }, [counselorsHash]);

  // Updates current filters from UI state
  useEffect(() => {
    const statuses = filterCheckedItems(statusValues);
    const counsellors = filterCheckedItems(counselorValues);
    updateCaseListFilter({
      statuses,
      counsellors,
      includeOrphans: false,
      ...dateFilterValues,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiFiltersComparable]);

  // Updates UI state from current filters
  useEffect(() => {
    const { counsellors, statuses, includeOrphans, ...currentDateFilters } = currentFilter;
    const newCounselorValues = counselorValues.map(cv => ({ ...cv, checked: counsellors.includes(cv.value) }));
    const newStatusValues = statusValues.map(sv => ({ ...sv, checked: statuses.includes(sv.value) }));
    setCounselorValues(newCounselorValues);
    setStatusValues(newStatusValues);
    setDateFilterValues(currentDateFilters);
    setUIFilterComparable(
      JSON.stringify({
        statusValues: newStatusValues,
        counselorValues: newCounselorValues,
        dateFilterValues: currentDateFilters,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterCompare]);

  const handleApplyStatusFilter = (values: Item[]) => {
    setStatusValues(values);
    setUIFilterComparable(JSON.stringify({ statusValues: values, dateFilterValues, counselorValues }));
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    setCounselorValues(values);
    setUIFilterComparable(JSON.stringify({ statusValues, dateFilterValues, counselorValues: values }));
  };

  const handleApplyDateRangeFilter = (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => {
    const updatesDateFilterValues = { ...dateFilterValues, [filter.filterPayloadParameter]: filterValue };
    setDateFilterValues(updatesDateFilterValues);
    setUIFilterComparable(JSON.stringify({ statusValues, dateFilterValues: updatesDateFilterValues, counselorValues }));
  };

  const handleClearFilters = () => {
    clearCaseListFilter();
  };

  const { strings, featureFlags } = getConfig();

  const getCasesCountString = () =>
    caseCount === 1 ? 'CaseList-Filters-CaseCount-Singular' : 'CaseList-Filters-CaseCount-Plural';

  const hasFiltersApplied =
    filterCheckedItems(statusValues).length > 0 ||
    filterCheckedItems(counselorValues).length > 0 ||
    Boolean(Object.values(dateFilterValues).filter(dfv => dfv).length);

  return (
    <>
      <FiltersContainer id="CaseList-Cases-label">
        <CasesTitle>
          <Template code="CaseList-Cases" />
        </CasesTitle>
        {hasFiltersApplied && (
          <FiltersResetAll type="button" onClick={handleClearFilters}>
            <Template code="CaseList-Filters-ResetAllFilters" />
          </FiltersResetAll>
        )}
        <CasesCount>
          <Template code={getCasesCountString()} count={caseCount} />
        </CasesCount>
      </FiltersContainer>
      {featureFlags.enable_filter_cases && (
        <FiltersContainer>
          <FilterList />
          <FilterBy>
            <Template code="CaseList-FilterBy" />
          </FilterBy>
          <MultiSelectFilter
            name="status"
            text={strings['CaseList-Filters-Status']}
            defaultValues={statusValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyStatusFilter}
            setOpenedFilter={setOpenedFilter}
          />
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
          <FiltersContainer style={{ marginLeft: '100px', boxShadow: 'none' }}>
            <DateRange fontSize="inherit" style={{ marginRight: 5 }} />
            <Template code="CaseList-Filters-DateFiltersLabel" />
            {getInitialDateFilters().map(df => {
              return (
                <DateRangeFilter
                  labelKey={df.labelKey}
                  key={df.filterPayloadParameter}
                  name={`${df.filterPayloadParameter}Filter`}
                  options={df.options}
                  openedFilter={openedFilter}
                  applyFilter={handleApplyDateRangeFilter(df)}
                  setOpenedFilter={setOpenedFilter}
                  current={dateFilterValues[df.filterPayloadParameter]}
                />
              );
            })}
          </FiltersContainer>
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
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Filters);

export default connected;
