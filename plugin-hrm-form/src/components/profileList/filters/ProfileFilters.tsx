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

import React, { useState, useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import FilterList from '@material-ui/icons/FilterList';

import { useProfilesList, useProfilesListSettings } from '../../../states/profile/hooks/useProfilesList';
import { getTemplateStrings } from '../../../hrmConfig';
import MultiSelectFilter, { Item } from '../../caseList/filters/MultiSelectFilter';
import { CountText, FiltersContainer, FiltersResetAll, FilterTitle, MainTitle } from '../../../styles';
import { useProfilesListLoader } from '../../../states/profile/hooks/useProfilesListLoader';
import { useAllProfileFlags } from '../../../states/profile/hooks';

const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

const ProfileFilters: React.FC = () => {
  const [openedFilter, setOpenedFilter] = useState<string>(null);
  const [statusValues, setStatusValues] = useState<Item[]>([]);

  const { count } = useProfilesList();

  const { updateProfilesListSettings, clearProfilesListFilters } = useProfilesListLoader();

  // Populate all the flags as filter options in the status filter
  const { allProfileFlags, loading: flagsLoading } = useAllProfileFlags();

  useEffect(() => {
    if (!flagsLoading && allProfileFlags) {
      const newStatusValues = allProfileFlags.map(flag => ({
        value: flag.id.toString(),
        label: flag.name.charAt(0).toUpperCase() + flag.name.slice(1),
        checked: false,
      }));
      setStatusValues(newStatusValues);
    }
  }, [allProfileFlags, flagsLoading]);

  const strings = getTemplateStrings();

  const handleApplyStatusFilter = (values: Item[]) => {
    updateProfilesListSettings({ filter: { statuses: filterCheckedItems(values) } });
  };

  const { filter } = useProfilesListSettings();
  const hasFiltersApplied = filter.statuses.length > 0;

  const handleClearFilters = () => {
    clearProfilesListFilters({ filter: { statuses: [] } });
  };

  const showStatusFilter = () => {
    return (
      <MultiSelectFilter
        name="status"
        text={strings['ProfileList-THStatus']}
        defaultValues={statusValues}
        openedFilter={openedFilter}
        applyFilter={handleApplyStatusFilter}
        setOpenedFilter={setOpenedFilter}
      />
    );
  };

  const getProfileCountString = () => (count === 1 ? 'ProfileList-Count-Singular' : 'ProfileList-Count-Plural');

  return (
    <>
      <FiltersContainer>
        <MainTitle>
          <Template code="ProfileList-Clients" />
        </MainTitle>
        {hasFiltersApplied && (
          <FiltersResetAll type="button" onClick={handleClearFilters} aria-label="Reset Filters">
            <Template code="CaseList-Filters-ResetAllFilters" />
          </FiltersResetAll>
        )}
        <CountText>
          <Template code={getProfileCountString()} count={count} />
        </CountText>
      </FiltersContainer>
      <FiltersContainer>
        <FilterList fontSize="small" />
        <FilterTitle>
          <Template code="Table-FilterBy" />
        </FilterTitle>
        {count > 0 && !flagsLoading && showStatusFilter()}
      </FiltersContainer>
    </>
  );
};

export default ProfileFilters;
