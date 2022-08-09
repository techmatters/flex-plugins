import React from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import { Button, Popover } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import { callTypes } from 'hrm-form-definitions';

import { Row } from '../../styles/HrmStyles';
import { ConfirmContainer, ConfirmText, CancelButton } from '../../styles/search';
import TabPressWrapper from '../TabPressWrapper';
import { contactType } from '../../types';
import { hasTaskControl } from '../../utils/transfer';

const ConnectDialog = ({ anchorEl, currentIsCaller, contact, handleConfirm, handleClose, task, buttonData }) => {
  const isOpen = Boolean(anchorEl);
  const id = isOpen ? 'simple-popover' : undefined;

  const getText = () => {
    const callType = contact && contact.details && contact.details.callType;
    if (!callType) return '';

    switch (callType) {
      case callTypes.child:
        return <Template code="ConnectDialog-Child" />;
      case callTypes.caller:
        if (currentIsCaller && buttonData) return <Template code="ConnectDialog-Caller" />;
        return <Template code="ConnectDialog-Child" />;
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
              <Template code="CaseHeader-Cancel" />
            </CancelButton>
            <Button
              autoFocus
              tabIndex={1}
              variant="contained"
              size="medium"
              onClick={handleConfirm}
              style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
              disabled={!hasTaskControl(task)}
            >
              <CheckIcon />
              <Template code="CaseHeader-Copy" />
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
  task: PropTypes.shape({}),
};
ConnectDialog.defaultProps = {
  anchorEl: null,
  contact: null,
  task: {},
};

export default ConnectDialog;
