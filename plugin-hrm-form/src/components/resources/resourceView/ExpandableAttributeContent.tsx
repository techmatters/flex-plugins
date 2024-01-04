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
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { StyledLink } from '../../search/styles';
import { useExpandableOnOverflow } from '../../../hooks/useExpandableOnOverflow';

type ExpandableAttributeContentProps = {
  expandLinkText: string;
  collapseLinkText: string;
  content: string;
};

const ExpandableAttributeContent: React.FC<ExpandableAttributeContentProps & Partial<StyledProps>> = ({
  content,
  expandLinkText,
  collapseLinkText,
}) => {
  const {
    collapseButtonElementRef,
    expandButtonElementRef,
    handleCollapse,
    handleExpand,
    isExpanded,
    isOverflowing,
    overflowingRef,
  } = useExpandableOnOverflow({});

  return (
    <div>
      <div
        ref={overflowingRef}
        style={{
          overflow: isOverflowing && !isExpanded ? 'hidden' : 'inherit',
          height: 'auto',
          maxHeight: isExpanded ? undefined : '120px',
        }}
      >
        <Template code={content} />
        {isExpanded && (
          <StyledLink
            underline={true}
            type="button"
            onClick={handleCollapse}
            ref={collapseButtonElementRef}
            style={{ marginTop: -3.5 }}
          >
            <Template code={collapseLinkText} />
          </StyledLink>
        )}
      </div>
      {isOverflowing && !isExpanded && (
        <StyledLink underline={true} onClick={handleExpand} ref={expandButtonElementRef} style={{ marginTop: -3.5 }}>
          {'...'}
          <Template code={expandLinkText} />
        </StyledLink>
      )}
    </div>
  );
};

ExpandableAttributeContent.displayName = 'ExpandableAttributeContent';

export default ExpandableAttributeContent;
