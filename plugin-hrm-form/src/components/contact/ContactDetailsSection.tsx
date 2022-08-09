import React, { Dispatch } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ArrowDropDownTwoTone, ArrowRightTwoTone, Edit, Link } from '@material-ui/icons';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
  SectionActionButton,
} from '../../styles/search';
import { checkButtonData } from '../../states/contacts/actions';
import { namespace, RootState, searchContactsBase } from '../../states';

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
  ...props
}) => {
  const showCopyButton = () =>
    buttonDataTestid === 'ContactDetails-Section-ChildInformation' ||
    buttonDataTestid === 'ContactDetails-Section-CallerInformation';
  const handleCopyInfo = () => props.checkButtonData(buttonDataTestid === 'ContactDetails-Section-CallerInformation');

  return (
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
        {showActionIcons && showCopyButton && (
          <SectionActionButton
            onClick={e => {
              handleOpenConnectDialog(e);
              handleCopyInfo();
            }}
          >
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
};

ContactDetailsSection.displayName = 'ContactDetailsSection';

const mapDispatchToProps = {
  checkButtonData,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(ContactDetailsSection);
export default connected;
