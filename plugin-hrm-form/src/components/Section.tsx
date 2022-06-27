import React from 'react';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
} from '../styles/search';

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
        buttonRef={buttonRef => {
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
