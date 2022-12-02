import React, { useEffect, useRef } from 'react';
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { useIsOverflowing } from './detectOverflow';
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
  const ref = React.useRef();
  const isOverflowing = useIsOverflowing(ref);
  const [isExpanded, setExpanded] = React.useState(false);
  const expandButtonElement = useRef<HTMLButtonElement>(undefined);
  const collapseButtonElement = useRef<HTMLButtonElement>(undefined);

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  useEffect(() => {
    if (isExpanded) {
      collapseButtonElement.current?.focus();
    } else {
      expandButtonElement.current?.focus();
    }
  }, [isExpanded]);

  return (
    <>
      <div className={className} style={{ display: 'flex', flexFlow: 'row', justifyContent: 'stretch' }} ref={ref}>
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
            ref={collapseButtonElement}
            style={{ display: isExpanded ? 'inline' : 'none', marginTop: -3.5 }}
          >
            {collapseLinkText}
          </StyledLink>
        </div>
        <div style={{ whiteSpace: 'nowrap', display: isOverflowing && !isExpanded ? 'inherit' : 'none' }}>
          <StyledLink underline={true} onClick={handleExpand} ref={expandButtonElement} style={{ marginTop: -3.5 }}>
            <Template code={isExpanded ? collapseLinkText : expandLinkText} />
          </StyledLink>
        </div>
      </div>
    </>
  );
};

ExpandableTextBlock.displayName = 'ExpandableTextBlock';

export default ExpandableTextBlock;
