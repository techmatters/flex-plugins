import React from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { ArrowDropDownTwoTone, ArrowRightTwoTone, Edit, Link } from '@material-ui/icons';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
  SectionActionButton,
} from '../../styles/search';
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
  task?: any;
  callType?: string;
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
  ...props
}) => {
  const showCopyButton = () => callType === 'child' || callType === 'caller';
  const handleSetCallType = () => props.setCallType(callType === 'caller');

  return (
    <>
      <SectionTitleContainer data-testid="ContactDetails-Section">
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
          <>
            <SectionActionButton type="button" onClick={handleEditClick}>
              <EditIcon style={{ fontSize: '14px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
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
};

ContactDetailsSection.displayName = 'ContactDetailsSection';

const mapDispatchToProps = {
  setCallType,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(ContactDetailsSection);
export default connected;
