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
import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import ArrowRightTwoTone from '@material-ui/icons/ArrowRightTwoTone';
import ArrowDropDownTwoTone from '@material-ui/icons/ArrowDropDownTwoTone';

import { FilterOption } from '../../../../states/resources/types';
import { getTemplateStrings } from '../../../../hrmConfig';
import { SectionCollapse } from '../../../search/styles';
import { ResourcesSearchFormFilterHeader, ResourcesSearchFormSettingBox, SectionTitleButton } from '../../styles';
import SearchInput from '../../../caseList/filters/SearchInput';
import { CheckboxMultiSelectOptions } from '../CheckboxMultiSelectFilter';

const CATEGORIES_OPTIONS_ID = 'resources-search-categories-options';

const optionMatchesSearchTerm = (searchTerm: string) => ({ value, label }: FilterOption) =>
  (label ?? value).toLowerCase().includes(searchTerm.trim().toLowerCase());

type Props = {
  loading: boolean;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selectedValues: string[] | undefined) => void;
};

/**
 * There are too many categories to show them all at once, so the list starts collapsed
 * and can be narrowed down with a search term once expanded.
 */
const CategoriesFilter: React.FC<Props> = ({ loading, options, selectedValues, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const strings = getTemplateStrings();

  return (
    <ResourcesSearchFormSettingBox>
      <SectionTitleButton
        aria-expanded={expanded}
        aria-controls={CATEGORIES_OPTIONS_ID}
        // The options aren't available until they finish loading, so there is nothing to expand yet
        disabled={loading}
        onClick={() => setExpanded(!expanded)}
        style={{ justifyContent: 'flex-start' }}
      >
        {expanded ? <ArrowDropDownTwoTone /> : <ArrowRightTwoTone />}
        <ResourcesSearchFormFilterHeader style={{ marginBottom: 0 }}>
          <Template code="Resources-Search-categories" />
          {selectedValues.length > 0 && (
            <>
              &nbsp;
              <Template code="Resources-Search-categories-SelectedCount" count={selectedValues.length} />
            </>
          )}
        </ResourcesSearchFormFilterHeader>
        {loading && (
          <CircularProgress
            // MUI's shrink animation freezes when the main thread is busy, making the spinner look stuck
            disableShrink
            size={14}
            style={{ marginLeft: '8px' }}
            aria-label={strings['Resources-Search-categories-Loading']}
          />
        )}
      </SectionTitleButton>
      <SectionCollapse expanded={expanded} timeout="auto">
        <div id={CATEGORIES_OPTIONS_ID} style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <SearchInput
              id="resources-search-categories-search"
              label={strings['Resources-Search-categories-SearchLabel']}
              searchTerm={searchTerm}
              innerRef={null}
              onChangeSearch={event => setSearchTerm(event.target.value)}
              clearSearchTerm={() => setSearchTerm('')}
              onShiftTab={() => {
                /* no special tab handling needed */
              }}
            />
          </div>
          <CheckboxMultiSelectOptions
            options={options.filter(optionMatchesSearchTerm(searchTerm))}
            selectedValues={selectedValues}
            onChange={onChange}
          />
        </div>
      </SectionCollapse>
    </ResourcesSearchFormSettingBox>
  );
};

CategoriesFilter.displayName = 'CategoriesFilter';

export default CategoriesFilter;
