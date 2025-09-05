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
/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';

import { Flex } from '../../../styles';
import { ResourcePreviewHeaderText, ResourcePreviewWrapper } from '../styles';
import { PreviewRow, StyledLink } from '../../search/styles';
import { isMissingResource, ReferrableResourceResult } from '../../../states/resources/search';
import ResourceIdCopyButton from '../ResourceIdCopyButton';
import { ResourcePreviewAttributes } from '../mappingComponents';

type OwnProps = {
  resourceResult: ReferrableResourceResult;
  onClickViewResource: () => void;
};

type Props = OwnProps;

const ResourcePreview: React.FC<Props> = ({ resourceResult, onClickViewResource }) => {
  if (isMissingResource(resourceResult)) {
    // We could put a placeholder here, but it's probably better to just not show anything
    return <hr style={{ width: '100%', height: '3px', opacity: 0.3 }} />;
  }
  const { id, name } = resourceResult;

  // type Category = { id: string; value: string; color: string };
  return (
    <Flex>
      <ResourcePreviewWrapper>
        <div>
          <PreviewRow>
            <Flex justifyContent="space-between" style={{ width: '100%' }}>
              <StyledLink
                underline={true}
                style={{ width: '70%', marginInlineEnd: 10, justifyContent: 'left' }}
                onClick={onClickViewResource}
                data-testid="resource-name"
              >
                <ResourcePreviewHeaderText>{name}</ResourcePreviewHeaderText>
              </StyledLink>
              {/* </Flex>*/}
              <Flex style={{ justifyContent: 'flex-end' }}>
                <ResourceIdCopyButton resourceId={id} />
              </Flex>
            </Flex>
          </PreviewRow>
        </div>
        <ResourcePreviewAttributes resource={resourceResult} />
      </ResourcePreviewWrapper>
    </Flex>
  );
};

ResourcePreview.displayName = 'ResourcePreview';

export default ResourcePreview;
