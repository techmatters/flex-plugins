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

import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import FilterList from '@material-ui/icons/FilterList';

import { getTemplateStrings } from '../../../hrmConfig';
import MultiSelectFilter, { Item } from '../../caseList/filters/MultiSelectFilter';
import { CountText, FiltersContainer, FiltersResetAll, FilterTitle, MainTitle } from '../../../styles';
import { useProfilesListLoader } from '../../../states/profile/hooks/useProfilesListLoader';
import { useAllProfileFlags } from '../../../states/profile/hooks';
import { useProfilesList } from '../../../states/profile/hooks/useProfilesList';

const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

const ProfileFilters: React.FC = () => {
  const {
    settings: { count, filter },
    loading: countLoading,
  } = useProfilesList();
  const strings = getTemplateStrings();
  const [openedFilter, setOpenedFilter] = useState<string>();

  const { allProfileFlags, loading: flagsLoading } = useAllProfileFlags();

  const [statusValues, setStatusValues] = useState<Item[]>([]);
  const { updateProfilesListFilter } = useProfilesListLoader();

  const handleApplyStatusFilter = (values: Item[]) => {
    console.log('>>> handleApplyStatusFilter', values);
    updateProfilesListFilter({ statuses: filterCheckedItems(values) });
  };

  useEffect(() => {
    const statusValues = allProfileFlags?.map(flag => ({
      value: flag.name,
      label: flag.name.charAt(0).toUpperCase() + flag.name.slice(1),
      checked: false,
    }));
    if (!flagsLoading) setStatusValues(statusValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flagsLoading]);

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

  const hasFiltersApplied = filterCheckedItems(statusValues).length > 0;

  const handleClearFilters = () => {
    clearProfileListFilter();
  };

  const getProfileCountString = () => (count === 1 ? 'ProfileList-Count-Singular' : 'ProfileList-Count-Plural');
  return (
    <>
      <FiltersContainer>
        <MainTitle>
          <Template code="ProfileList-Clients" />
        </MainTitle>
        {hasFiltersApplied && (
          <FiltersResetAll type="button" onClick={handleClearFilters}>
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
        {!countLoading && !flagsLoading && showStatusFilter()}
      </FiltersContainer>
    </>
  );
};

export default ProfileFilters;
