import React, { useState } from 'react';
import ArrowRightTwoTone from '@material-ui/icons/ArrowRightTwoTone';
import ArrowDropDownTwoTone from '@material-ui/icons/ArrowDropDownTwoTone';

import { SectionTitleContainer, SectionTitleButton, SectionTitleText, SectionCollapse } from '../../../styles/search';

type ExpandableSectionProps = {
  title: string | JSX.Element;
  children: any;
  hideIcon?: boolean;
  htmlElRef?: React.Ref<HTMLButtonElement>;
};

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children, hideIcon, htmlElRef }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <>
      <SectionTitleContainer data-testid="Expandable-Section">
        <SectionTitleButton ref={htmlElRef} onClick={handleExpandClick}>
          {!hideIcon && (expanded ? <ArrowDropDownTwoTone /> : <ArrowRightTwoTone />)}
          <SectionTitleText>{title}</SectionTitleText>
        </SectionTitleButton>
      </SectionTitleContainer>
      <SectionCollapse expanded={expanded} timeout="auto">
        {children}
      </SectionCollapse>
    </>
  );
};

ExpandableSection.displayName = 'ExpandableSection';

export default ExpandableSection;
