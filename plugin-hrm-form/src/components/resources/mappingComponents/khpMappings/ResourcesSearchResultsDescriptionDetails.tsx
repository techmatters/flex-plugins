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
import { Template } from '@twilio/flex-ui';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../../states';
import { ResourcesSearchResultsDescriptionItem } from '../../styles';
import { namespace, referrableResourcesBase } from '../../../../states/storeNamespaces';
import { KHPFilterSelections } from './filterSelectionState';

const ResourcesSearchResultsDescriptionDetails: React.FC<{}> = () => {
  const { filterOptions, parameters } = useSelector(
    (state: RootState) => state[namespace][referrableResourcesBase].search,
  );

  const filterSelections = (parameters.filterSelections || {}) as KHPFilterSelections;

  const ageRangeDescription = () => {
    const { minEligibleAge, maxEligibleAge } = filterSelections;
    if (minEligibleAge && maxEligibleAge) {
      return (
        <ResourcesSearchResultsDescriptionItem>
          <Template
            code="Resources-Search-ResultsDescription-AgeRange"
            minEligibleAge={minEligibleAge}
            maxEligibleAge={maxEligibleAge}
          />
        </ResourcesSearchResultsDescriptionItem>
      );
    } else if (minEligibleAge) {
      return (
        <ResourcesSearchResultsDescriptionItem>
          <Template code="Resources-Search-ResultsDescription-MinimumAge" minEligibleAge={minEligibleAge} />
        </ResourcesSearchResultsDescriptionItem>
      );
    } else if (maxEligibleAge) {
      return (
        <ResourcesSearchResultsDescriptionItem>
          <Template code="Resources-Search-ResultsDescription-MaximumAge" maxEligibleAge={maxEligibleAge} />
        </ResourcesSearchResultsDescriptionItem>
      );
    }
    return null;
  };

  const locationDescription = () => {
    const { province, city, region } = filterSelections;
    const location = [
      filterOptions.city.find(({ value }) => value === city)?.label,
      filterOptions.region.find(({ value }) => value === region)?.label,
      filterOptions.province.find(({ value }) => value === province)?.label,
    ]
      .filter(Boolean)
      .join(', ');
    if (location) {
      return (
        <ResourcesSearchResultsDescriptionItem>
          <Template code="Resources-Search-ResultsDescription-Location" location={location} />
        </ResourcesSearchResultsDescriptionItem>
      );
    }
    return null;
  };

  const filterDescription = (code: string, selections: string[]) => {
    const selectionsText = (selections ?? []).join(', ');
    if (selectionsText) {
      return (
        <ResourcesSearchResultsDescriptionItem>
          <Template code={code} selections={selectionsText} />
        </ResourcesSearchResultsDescriptionItem>
      );
    }
    return null;
  };

  return (
    <>
      {locationDescription()}
      {filterSelections.interpretationTranslationServicesAvailable && (
        <ResourcesSearchResultsDescriptionItem>
          <Template code="Resources-Search-ResultsDescription-InterpretationTranslationServicesAvailable" />
        </ResourcesSearchResultsDescriptionItem>
      )}
      {ageRangeDescription()}
      {filterDescription('Resources-Search-ResultsDescription-FeeStructure', filterSelections.feeStructure)}
      {filterDescription(
        'Resources-Search-ResultsDescription-HowServiceIsOffered',
        filterSelections.howServiceIsOffered,
      )}
    </>
  );
};

export default ResourcesSearchResultsDescriptionDetails;
