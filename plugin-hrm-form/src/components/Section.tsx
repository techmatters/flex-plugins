import React from 'react';
import { ArrowDropDownTwoTone, ArrowRightTwoTone, Edit } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
  SectionEditButton,
} from '../styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowRightIcon = ContactDetailsIcon(ArrowRightTwoTone);
const EditIcon = ContactDetailsIcon(Edit);

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
        {!hideIcon && (expanded ? <ArrowDownIcon /> : <ArrowRightIcon />)}
        <SectionTitleText>{sectionTitle}</SectionTitleText>
      </SectionTitleButton>
      {showEditButton && (
        <>
          <SectionEditButton type="button" onClick={handleEditClick}>
            <EditIcon style={{ fontSize: '14px' }} />
            <Template code="EditButton" />
          </SectionEditButton>
        </>
      )}
    </SectionTitleContainer>
    <SectionCollapse expanded={expanded} timeout="auto">
      {children}
    </SectionCollapse>
  </>
);

Section.displayName = 'Section';

export default Section;
