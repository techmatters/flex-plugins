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
import React, { useState } from 'react';
import ArrowRightTwoTone from '@material-ui/icons/ArrowRightTwoTone';
import ArrowDropDownTwoTone from '@material-ui/icons/ArrowDropDownTwoTone';

import { SectionCollapse } from '../../../styles/search';
import { SectionTitleContainer, SectionTitleButton, SectionTitleText } from '../styles';

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
        <div style={{ padding: '10px 0' }}>{children}</div>
      </SectionCollapse>
    </>
  );
};

ExpandableSection.displayName = 'ExpandableSection';

export default ExpandableSection;
