import React from 'react';
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { useExpandableOnOverflow } from '../../hooks/useExpandableOnOverflow';
import { StyledLink } from '../../styles/search';

export type ExpandableTextBlockProps = {
  expandLinkText: string;
  collapseLinkText: string;
};

const ExpandableTextBlock: React.FC<ExpandableTextBlockProps & Partial<StyledProps>> = ({
  children,
  expandLinkText,
  collapseLinkText,
  className,
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
    <div
      className={className}
      style={{ display: 'flex', flexFlow: 'row', justifyContent: 'stretch' }}
      ref={overflowingRef}
    >
      <div
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: isOverflowing && !isExpanded ? 'nowrap' : 'inherit',
          overflow: isOverflowing && !isExpanded ? 'hidden' : 'inherit',
          height: isExpanded ? 'inherit' : '1.5em',
          wordBreak: isExpanded ? 'break-word' : 'inherit',
        }}
      >
        {children}
        <StyledLink
          underline={true}
          type="button"
          onClick={handleCollapse}
          ref={collapseButtonElementRef}
          style={{ display: isExpanded ? 'inline' : 'none', marginTop: -3.5 }}
        >
          <Template code={collapseLinkText} />
        </StyledLink>
      </div>
      <div style={{ whiteSpace: 'nowrap', display: isOverflowing && !isExpanded ? 'inherit' : 'none' }}>
        <StyledLink underline={true} onClick={handleExpand} ref={expandButtonElementRef} style={{ marginTop: -3.5 }}>
          <Template code={expandLinkText} />
        </StyledLink>
      </div>
    </div>
  );
};

ExpandableTextBlock.displayName = 'ExpandableTextBlock';

export default ExpandableTextBlock;
