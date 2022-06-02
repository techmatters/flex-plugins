import React from 'react';
import { ArrowDropDownTwoTone, ArrowRightTwoTone, Edit, Link } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
  SectionActionButton,
} from '../../styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowRightIcon = ContactDetailsIcon(ArrowRightTwoTone);
const EditIcon = ContactDetailsIcon(Edit);
const LinkIcon = ContactDetailsIcon(Link);

type Props = {
  sectionTitle: string | JSX.Element;
  color?: string;
  expanded: boolean;
  handleExpandClick: (event?: any) => void;
  buttonDataTestid: string;
  hideIcon?: boolean;
  htmlElRef?: any;
  showEditButton?: boolean;
  handleEditClick?: (event?: any) => void;
  handleOpenConnectDialog?: (event: any) => void;
  showActionIcons?: boolean;
};

const ContactDetailsSection: React.FC<Props> = ({
  sectionTitle,
  expanded,
  hideIcon,
  children,
  handleExpandClick,
  buttonDataTestid,
  htmlElRef,
  showEditButton,
  handleEditClick,
  handleOpenConnectDialog,
  showActionIcons,
}) => (
  <>
    <SectionTitleContainer>
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
      {showActionIcons && buttonDataTestid === 'ContactDetails-Section-ChildInformation' && (
        <SectionActionButton onClick={handleOpenConnectDialog}>
          <LinkIcon style={{ fontSize: '18px', padding: '0 6px' }} />
          <Template code="ContactCopyButton" />
        </SectionActionButton>
      )}
      {showEditButton && (
        <>
          <SectionActionButton type="button" onClick={handleEditClick}>
            <EditIcon style={{ fontSize: '14px', padding: '3px 6px 0 6px' }} />
            <Template code="EditButton" />
          </SectionActionButton>
        </>
      )}
    </SectionTitleContainer>
    <SectionCollapse expanded={expanded} timeout="auto">
      {children}
    </SectionCollapse>
  </>
);

ContactDetailsSection.displayName = 'ContactDetailsSection';

export default ContactDetailsSection;
