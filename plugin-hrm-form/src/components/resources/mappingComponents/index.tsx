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

import type { ReferrableResource } from '../../../services/ResourceService';
import { getHrmConfig } from '../../../hrmConfig';
import KHPResourcePreviewAttributes from './khpMappings/ResourcePreviewAttributes';
import KHPResourceViewAttributes from './khpMappings/ResourceViewAttributes';
import USCHResourcePreviewAttributes from './uschMappings/ResourcePreviewAttributes';
import USCHResourceViewAttributes from './uschMappings/ResourceViewAttributes';

type MappingComponents = {
  ResourcePreviewAttributes: React.FC<{
    resource: ReferrableResource;
  }>;
  ResourceViewAttributes: React.FC<{
    resource: ReferrableResource;
  }>;
};

const khpMappingComponents: MappingComponents = {
  ResourcePreviewAttributes: KHPResourcePreviewAttributes,
  ResourceViewAttributes: KHPResourceViewAttributes,
};

const uschMappingComponents: MappingComponents = {
  ResourcePreviewAttributes: USCHResourcePreviewAttributes,
  ResourceViewAttributes: USCHResourceViewAttributes,
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

// eslint-disable-next-line import/no-unused-modules
export const ResourcePreviewAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourcePreviewAttributes resource={resource} />;
  }, [resource]);
};

// eslint-disable-next-line import/no-unused-modules
export const ResourceViewAttributes: React.FC<{ resource: ReferrableResource }> = ({ resource }) => {
  return React.useMemo(() => {
    const mappingComponents = getMappingComponents();
    return <mappingComponents.ResourceViewAttributes resource={resource} />;
  }, [resource]);
};
