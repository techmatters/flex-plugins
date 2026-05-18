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
import { USCHFilterSelections } from '../../../../states/resources/filterSelectionState/usch';

const ResourcesSearchResultsDescriptionDetails: React.FC<{}> = () => {
  const { filterOptions, parameters } = useSelector(
    (state: RootState) => state[namespace][referrableResourcesBase].search,
  );

  const filterSelections = (parameters.filterSelections || {}) as USCHFilterSelections;

  const locationDescription = () => {
    const { country, province, city } = filterSelections;
    const location = [
      country && filterOptions.country.find(({ value }) => value === country)?.label,
      province && filterOptions.province.find(({ value }) => value === province)?.label,
      city && filterOptions.city.find(({ value }) => value === city)?.label,
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

  return <>{locationDescription()}</>;
};

export default ResourcesSearchResultsDescriptionDetails;
