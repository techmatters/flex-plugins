import React, { useEffect, useRef } from 'react';
import type { StyledProps } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { StyledLink } from '../../styles/search';

type ExpandableAttributeContentProps = {
  expandLinkText: string;
  collapseLinkText: string;
  content: string;
};

const ExpandableAttributeContent: React.FC<ExpandableAttributeContentProps & Partial<StyledProps>> = ({
  content,
  expandLinkText,
  collapseLinkText,
  className,
}) => {
  const ref = React.useRef();
  const [isExpanded, setExpanded] = React.useState(false);
  const expandButtonElement = useRef<HTMLButtonElement>(undefined);
  const collapseButtonElement = useRef<HTMLButtonElement>(undefined);
  const trimmedContent = content.length > 300 ? content.slice(0, 300) : content;
  const isTrimmed = trimmedContent.length !== content.length;

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
    <div className={className} style={{ display: 'flex', flexFlow: 'row', justifyContent: 'stretch' }} ref={ref}>
      <div style={{ height: 'auto' }}>
        {isTrimmed && isExpanded ? content : trimmedContent}
        {isTrimmed &&
          (isExpanded ? (
            <StyledLink
              underline={true}
              type="button"
              onClick={handleCollapse}
              ref={collapseButtonElement}
              style={{ marginTop: -3.5 }}
            >
              <Template code={collapseLinkText} />
            </StyledLink>
          ) : (
            <StyledLink underline={true} onClick={handleExpand} ref={expandButtonElement} style={{ marginTop: -3.5 }}>
              {'...'}
              <Template code={expandLinkText} />
            </StyledLink>
          ))}
      </div>
    </div>
  );
};

ExpandableAttributeContent.displayName = 'ExpandableAttributeContent';

export default ExpandableAttributeContent;
