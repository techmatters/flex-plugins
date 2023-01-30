import React from 'react';
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { StyledLink } from '../../styles/search';
import { useExpandableOnOverflow } from '../../hooks/useExpandableOnOverflow';

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
        {content}
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
