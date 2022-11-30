import React from 'react';

import { useIsOverflowing } from './detectOverflow';
import { StyledLink } from '../../styles/search';

type ExpandableTextBlockProps = {
  expandLinkText: string;
  collapseLinkText: string;
};

const ExpandableTextBlock: React.FC<ExpandableTextBlockProps> = ({ children, expandLinkText, collapseLinkText }) => {
  const ref = React.useRef();
  const isOverflowing = useIsOverflowing(ref);
  const [isExpanded, setExpanded] = React.useState(false);

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'stretch' }} ref={ref}>
        <div
          style={{
            textOverflow: isExpanded ? 'inherit' : 'ellipsis',
            whiteSpace: isOverflowing && !isExpanded ? 'nowrap' : 'inherit',
            overflow: isOverflowing && !isExpanded ? 'hidden' : 'inherit',
            height: isExpanded ? 'inherit' : '1.5em',
          }}
        >
          {children}
        </div>
        {isOverflowing && !isExpanded && (
          <div style={{ whiteSpace: 'nowrap' }} onClick={() => setExpanded(true)}>
            {expandLinkText}
          </div>
        )}
      </div>
      {isExpanded && (
        <div>
          <StyledLink type="button" onClick={() => setExpanded(false)}>
            {collapseLinkText}
          </StyledLink>
        </div>
      )}
    </>
  );
};

ExpandableTextBlock.displayName = 'ExpandableTextBlock';

export default ExpandableTextBlock;
