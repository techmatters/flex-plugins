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
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
} from '../../search/styles';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

type MyProps = {
  sectionTitle: string | JSX.Element;
  color?: string;
  expanded: boolean;
  handleExpandClick: (event?: any) => void;
  buttonDataTestid: string;
  hideIcon?: boolean;
  htmlElRef?: any;
  showEditButton?: boolean;
  handleEditClick?: (event?: any) => void;
};

const Section: React.FC<MyProps> = ({
  color,
  sectionTitle,
  expanded,
  hideIcon,
  children,
  handleExpandClick,
  buttonDataTestid,
  htmlElRef,
  showEditButton,
  handleEditClick = () => {
    /* */
  },
}) => (
  <>
    <SectionTitleContainer color={color}>
      <SectionTitleButton
        ref={buttonRef => {
          if (htmlElRef) {
            htmlElRef.current = buttonRef;
          }
        }}
        onClick={handleExpandClick}
        data-testid={buttonDataTestid}
      >
        <SectionTitleText>{sectionTitle}</SectionTitleText>
        {!hideIcon && (expanded ? <ArrowUpIcon /> : <ArrowDownIcon />)}
      </SectionTitleButton>
      {showEditButton && (
        <button type="button" onClick={handleEditClick}>
          <Template code="EditButton" />
        </button>
      )}
    </SectionTitleContainer>
    <SectionCollapse expanded={expanded} timeout="auto">
      {children}
    </SectionCollapse>
  </>
);

Section.displayName = 'Section';

export default Section;
