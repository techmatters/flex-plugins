/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';
import FilterList from '@material-ui/icons/FilterList';

import { getConfig } from '../../../HrmFormPlugin';
import { FiltersContainer, FiltersResetAll, CasesTitle, CasesCount, FilterBy } from '../../../styles/caseList/filters';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import { ListCasesFilters, CounselorHash } from '../../../types/types';
import DateRangeFilter from './DateRangeFilter';
import {
  DateFilterOption,
  DateFilterType,
  dateFilterPayloadFromFilters,
  followUpDateFilterOptions,
  standardCaseListDateFilterOptions,
} from './dateFilters';
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

const emptyFilters: ListCasesFilters = {
  counsellors: [],
  statuses: [],
  includeOrphans: false,
};

const getInitialDateFilters = (): DateFilterType[] => [
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
 * Gets an array of items (type Item[]) and makes all of them checked = false
 * @param values Item[]
 * @param setValues setter function
 */
const clearMultiSelectFilter = (values, setValues) => {
  const clearedValues = values.map(value => ({ ...value, checked: false }));
  setValues(clearedValues);
};

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
  handleApplyFilter: (filters: ListCasesFilters) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const Filters: React.FC<Props> = ({ currentDefinitionVersion, counselorsHash, caseCount, handleApplyFilter }) => {
  const statusInitialValues = getStatusInitialValue(currentDefinitionVersion);

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState<Item[]>(statusInitialValues);
  const [counselorValues, setCounselorValues] = useState<Item[]>([]);
  const [dateFilters, setDateFilters] = useState<DateFilterType[]>(getInitialDateFilters());
  const [defaultFilters, setDefaultFilters] = useState<ListCasesFilters>(emptyFilters);

  // updates counselor options when counselorHash is updated
  useEffect(() => {
    const counselorInitialValues = getCounselorsInitialValue(counselorsHash);
    setCounselorValues(counselorInitialValues);
  }, [counselorsHash]);

  // Keeps defaultFilters up-to-date
  useEffect(() => {
    const statuses = filterCheckedItems(statusValues);
    const counsellors = filterCheckedItems(counselorValues);
    setDefaultFilters({ statuses, counsellors, includeOrphans: false, ...dateFilterPayloadFromFilters(dateFilters) });
  }, [setDefaultFilters, statusValues, counselorValues]);

  const handleApplyStatusFilter = (values: Item[]) => {
    const filters = {
      ...defaultFilters,
      statuses: filterCheckedItems(values),
      ...dateFilterPayloadFromFilters(dateFilters),
    };
    handleApplyFilter(filters);
    setStatusValues(values);
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    const filters = {
      ...defaultFilters,
      counsellors: filterCheckedItems(values),
      ...dateFilterPayloadFromFilters(dateFilters),
    };
    handleApplyFilter(filters);
    setCounselorValues(values);
  };

  const handleApplyDateRangeFilter = (filterType: DateFilterType) => (filterOption: DateFilterOption | undefined) => {
    filterType.currentSetting = filterOption;
    setDateFilters(dateFilters); // refresh date filters after being modified in place locally
    handleApplyFilter({ ...defaultFilters, ...dateFilterPayloadFromFilters(dateFilters) } as ListCasesFilters);
  };

  const handleClearFilters = () => {
    clearMultiSelectFilter(statusValues, setStatusValues);
    clearMultiSelectFilter(counselorValues, setCounselorValues);
    setDateFilters(getInitialDateFilters());
    setOpenedFilter(null);
    handleApplyFilter(emptyFilters);
  };

  const { strings, featureFlags } = getConfig();

  const getCasesCountString = () =>
    caseCount === 1 ? 'CaseList-Filters-CaseCount-Singular' : 'CaseList-Filters-CaseCount-Plural';

  const hasFiltersApplied =
    filterCheckedItems(statusValues).length > 0 || filterCheckedItems(counselorValues).length > 0;

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
          <FiltersContainer style={{ marginLeft: '100px' }}>
            <Template code="CaseList-Filters-DateFiltersLabel" />
            {dateFilters.map(df => {
              return (
                <DateRangeFilter
                  labelKey={df.labelKey}
                  key={df.filterPayloadParameter}
                  name={`${df.filterPayloadParameter}Filter`}
                  options={df.options}
                  openedFilter={openedFilter}
                  applyFilter={handleApplyDateRangeFilter(df)}
                  setOpenedFilter={setOpenedFilter}
                  current={df.currentSetting}
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

export default Filters;
