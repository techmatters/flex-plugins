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
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { ArrowDropDownTwoTone, ArrowRightTwoTone, Edit, Link } from '@material-ui/icons';

import { RootState } from '../../states';
import { contactFormsBase, namespace } from '../../states/storeNamespaces';
import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
  SectionActionButton,
} from '../search/styles';
import { setCallType } from '../../states/contacts/actions';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowRightIcon = ContactDetailsIcon(ArrowRightTwoTone);
const EditIcon = ContactDetailsIcon(Edit);
const LinkIcon = ContactDetailsIcon(Link);

type OwnProps = {
  sectionTitle: string | JSX.Element;
  expanded: boolean;
  handleExpandClick: (event?: any) => void;
  children: any;
  buttonDataTestid: string;
  hideIcon?: boolean;
  htmlElRef?: any;
  showEditButton?: boolean;
  handleEditClick?: (event?: any) => void;
  handleOpenConnectDialog?: (event: any) => void;
  showActionIcons?: boolean;
  extraActionButton?: React.ReactElement;
  callType?: string;
  contactId?: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetailsSection: React.FC<Props> = ({
  sectionTitle,
  expanded,
  hideIcon,
  children,
  handleExpandClick,
  buttonDataTestid,
  htmlElRef,
  showEditButton,
  handleOpenConnectDialog,
  showActionIcons,
  handleEditClick,
  callType,
  savedContact,
  extraActionButton,
  ...props
}) => {
  const showCopyButton = () => callType === 'child' || callType === 'caller';
  const handleSetCallType = () => props.setCallType(callType === 'caller');

  return (
    <>
      <SectionTitleContainer data-testid="ContactDetails-Section">
        <SectionTitleButton
          ref={buttonRef => {
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

        {showActionIcons && showCopyButton && (
          <SectionActionButton
            onClick={e => {
              handleOpenConnectDialog(e);
              handleSetCallType();
            }}
          >
            <LinkIcon style={{ fontSize: '18px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
            <Template code="ContactCopyButton" />
          </SectionActionButton>
        )}
        {showEditButton && (
          <SectionActionButton type="button" onClick={handleEditClick}>
            <EditIcon style={{ fontSize: '14px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
            <Template code="EditButton" />
          </SectionActionButton>
        )}
        {extraActionButton}
      </SectionTitleContainer>
      <SectionCollapse expanded={expanded} timeout="auto">
        {children}
      </SectionCollapse>
    </>
  );
};

ContactDetailsSection.displayName = 'ContactDetailsSection';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  savedContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.savedContact,
});

const mapDispatchToProps = () => ({
  setCallType,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetailsSection);
export default connected;
