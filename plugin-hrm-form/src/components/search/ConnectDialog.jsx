import React from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import { Button, Popover } from '@material-ui/core';

import { Row } from '../../styles/HrmStyles';
import { ConfirmContainer, ConfirmText, CancelButton } from '../../styles/search';
import TabPressWrapper from '../TabPressWrapper';
import callTypes from '../../states/DomainConstants';
import { contactType } from '../../types';

const ConnectDialog = ({ anchorEl, currentIsCaller, contact, handleConfirm, handleClose }) => {
  const isOpen = Boolean(anchorEl);
  const id = isOpen ? 'simple-popover' : undefined;

  const msgTemplate = w => `Copy ${w} information from this record to new contact?`;

  const getText = () => {
    const callType = contact && contact.details && contact.details.callType;
    if (!callType) return '';

    switch (callType) {
      case callTypes.child:
        return msgTemplate('child');
      case callTypes.caller:
        return msgTemplate(currentIsCaller ? 'caller' : 'child');
      default:
        return '';
    }
  };

  return (
    <Popover
      id={id}
      open={isOpen}
      onClose={handleClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <TabPressWrapper>
        <ConfirmContainer>
          <ConfirmText>{getText()}</ConfirmText>
          <Row>
            <CancelButton tabIndex={2} variant="text" size="medium" onClick={handleClose}>
              cancel
            </CancelButton>
            <Button
              autoFocus
              tabIndex={1}
              variant="contained"
              size="medium"
              onClick={handleConfirm}
              style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
            >
              <CheckIcon />
              yes, copy
            </Button>
          </Row>
        </ConfirmContainer>
      </TabPressWrapper>
    </Popover>
  );
};

ConnectDialog.displayName = 'ConnectDialog';
ConnectDialog.propTypes = {
  anchorEl: PropTypes.instanceOf(Element),
  currentIsCaller: PropTypes.bool.isRequired,
  contact: contactType,
  handleConfirm: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};
ConnectDialog.defaultProps = {
  anchorEl: null,
  contact: null,
};

export default ConnectDialog;
