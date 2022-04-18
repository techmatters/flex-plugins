/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';

import { getConfig } from '../../../HrmFormPlugin';
import { FiltersContainer } from '../../../styles/caseList';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import { ListCasesFilters, CounselorHash } from '../../../types/types';
import DateRangeFilter from './DateRangeFilter';
import { standardCaseListDateFilterOptions } from './dateFilters';

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
  handleApplyFilter: (filters: ListCasesFilters) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const Filters: React.FC<Props> = ({ currentDefinitionVersion, counselorsHash, handleApplyFilter }) => {
  const statusInitialValues = getStatusInitialValue(currentDefinitionVersion);

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState<Item[]>(statusInitialValues);
  const [counselorValues, setCounselorValues] = useState<Item[]>([]);
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
    setDefaultFilters({ statuses, counsellors, includeOrphans: false });
  }, [setDefaultFilters, statusValues, counselorValues]);

  const handleApplyStatusFilter = (values: Item[]) => {
    const filters = { ...defaultFilters, statuses: filterCheckedItems(values) };
    handleApplyFilter(filters);
    setStatusValues(values);
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    const filters = { ...defaultFilters, counsellors: filterCheckedItems(values) };
    handleApplyFilter(filters);
    setCounselorValues(values);
  };
  const handleClearFilters = () => {
    clearMultiSelectFilter(statusValues, setStatusValues);
    clearMultiSelectFilter(counselorValues, setCounselorValues);
    setOpenedFilter(null);
    handleApplyFilter(emptyFilters);
  };

  const { strings } = getConfig();

  return (
    <FiltersContainer>
      <span style={{ fontWeight: 600 }}>
        <Template code="CaseList-Filters" />
      </span>
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
        text={strings['CaseList-Filters-Counselor']}
        defaultValues={counselorValues}
        openedFilter={openedFilter}
        applyFilter={handleApplyCounselorFilter}
        setOpenedFilter={setOpenedFilter}
        searchable
      />
      <DateRangeFilter
        name="followUpDateFilter"
        options={standardCaseListDateFilterOptions()}
        openedFilter={openedFilter}
        applyFilter={handleApplyDateRangeFilter}
        setOpenedFilter={setOpenedFilter}
      />
      <button type="button" onClick={handleClearFilters}>
        <Template code="CaseList-Filters-ClearFilters" />
      </button>
    </FiltersContainer>
  );
};

Filters.displayName = 'Filters';

export default Filters;
