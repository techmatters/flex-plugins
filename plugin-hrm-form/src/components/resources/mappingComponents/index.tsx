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
import type { Handler } from 'redux-promise-middleware-actions/lib/reducers';

import type { LoadReferenceActionFunction } from '../../../states/resources/referenceLocations';
import type { FilterOption } from '../../../states/resources/types';
import type { ReferrableResourceSearchState, SearchSettings } from '../../../states/resources/search';
import type { ReferrableResource } from '../../../services/ResourceService';
import { getHrmConfig } from '../../../hrmConfig';
import KHPResourcePreviewAttributes from './khpMappings/ResourcePreviewAttributes';
import KHPResourceViewAttributes from './khpMappings/ResourceViewAttributes';
import KHPResourceSearchFilters from './khpMappings/ResourceSearchFilters';
import KHPResourcesSearchResultsDescriptionDetails from './khpMappings/ResourcesSearchResultsDescriptionDetails';
import * as khpFilterSelectionState from '../../../states/resources/filterSelectionState/khp';
import USCHResourcePreviewAttributes from './uschMappings/ResourcePreviewAttributes';
import USCHResourceViewAttributes from './uschMappings/ResourceViewAttributes';
import USCHResourceSearchFilters from './uschMappings/ResourceSearchFilters';
import USCHResourcesSearchResultsDescriptionDetails from './uschMappings/ResourcesSearchResultsDescriptionDetails';
import * as uschFilterSelectionState from '../../../states/resources/filterSelectionState/usch';

type FilterSelectionState = {
  loadReferenceActionFunction: (list: string) => LoadReferenceActionFunction;
  handlerUpdateSearchFormAction: Handler<
    ReferrableResourceSearchState,
    { type: string; payload: SearchSettings },
    ReferrableResourceSearchState
  >;
  handleLoadReferenceLocationsAsyncActionFulfilled: Handler<
    ReferrableResourceSearchState,
    { type: string; payload: { list: string; options: FilterOption[] } },
    ReferrableResourceSearchState
  >;
};

type MappingComponents = {
  ResourcePreviewAttributes: React.FC<{
    resource: ReferrableResource;
  }>;
  ResourceViewAttributes: React.FC<{
    resource: ReferrableResource;
  }>;
  ResourceSearchFilters: React.FC<{}>;
  ResourcesSearchResultsDescriptionDetails: React.FC<{}>;
  filterSelectionState: FilterSelectionState;
};

const khpMappingComponents: MappingComponents = {
  ResourcePreviewAttributes: KHPResourcePreviewAttributes,
  ResourceViewAttributes: KHPResourceViewAttributes,
  ResourceSearchFilters: KHPResourceSearchFilters,
  ResourcesSearchResultsDescriptionDetails: KHPResourcesSearchResultsDescriptionDetails,
  filterSelectionState: khpFilterSelectionState,
};

const uschMappingComponents: MappingComponents = {
  ResourcePreviewAttributes: USCHResourcePreviewAttributes,
  ResourceViewAttributes: USCHResourceViewAttributes,
  ResourceSearchFilters: USCHResourceSearchFilters,
  ResourcesSearchResultsDescriptionDetails: USCHResourcesSearchResultsDescriptionDetails,
  filterSelectionState: uschFilterSelectionState,
};

const getMappingComponents = (): MappingComponents => {
  const { helplineCode } = getHrmConfig();
  switch (helplineCode.toUpperCase()) {
    case 'E2E':
    case 'CA': {
      return khpMappingComponents;
    }
    case 'AS':
    case 'USCH': {
      return uschMappingComponents;
    }
    default: {
      throw new Error(`Mapping not defined for account ${helplineCode}`);
    }
  }
};

export const getFilterSelectionState = (): FilterSelectionState => getMappingComponents().filterSelectionState;

export const ResourcePreviewAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourcePreviewAttributes resource={resource} />;
  }, [resource]);
};

export const ResourceViewAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourceViewAttributes resource={resource} />;
  }, [resource]);
};

export const ResourceSearchFilters: React.FC<{}> = () => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourceSearchFilters />;
  }, []);
};

export const ResourcesSearchResultsDescriptionDetails: React.FC<{}> = () => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourcesSearchResultsDescriptionDetails />;
  }, []);
};
