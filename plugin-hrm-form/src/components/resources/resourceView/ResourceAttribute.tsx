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

import { Box, Column } from '../../../styles/HrmStyles';
import { ResourceAttributeContent, ResourceAttributeDescription } from '../styles';
import ExpandableAttributeContent from './ExpandableAttributeContent';

type Props = {
  description: string;
  isExpandable?: boolean;
  'data-testid'?: string;
};

const ResourceAttribute: React.FC<Props> = ({ description, children, isExpandable, 'data-testid': dataTestId }) => {
  const renderContent = () => {
    if (!children) {
      return <Template code="Resources-View-MissingProperty" />;
    }
    if (typeof children === 'string') {
      if (isExpandable === true) {
        return <ExpandableAttributeContent expandLinkText="ReadMore" collapseLinkText="ReadLess" content={children} />;
      }
      return <Template code={children} />;
    }

    return children;
  };

  return (
    <Box marginTop="8px" marginBottom="10px">
      <Column>
        <Box marginBottom="4px">
          <ResourceAttributeDescription>
            <Template code={description} />
          </ResourceAttributeDescription>
        </Box>
        <ResourceAttributeContent data-testid={dataTestId}>{renderContent()}</ResourceAttributeContent>
      </Column>
    </Box>
  );
};

ResourceAttribute.displayName = 'ResourceAttribute';

export default ResourceAttribute;
