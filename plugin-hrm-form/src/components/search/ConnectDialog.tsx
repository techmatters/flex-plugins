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
import CheckIcon from '@material-ui/icons/Check';
import { Button, Popover } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import { callTypes } from 'hrm-form-definitions';

import { Row } from '../../styles';
import { ConfirmContainer, ConfirmText, CancelButton } from './styles';
import TabPressWrapper from '../TabPressWrapper';
import { hasTaskControl } from '../../transfer/transferTaskState';
import { Contact, CustomITask } from '../../types/types';

type Props = {
  anchorEl: Element;
  currentIsCaller: boolean;
  contact: Contact;
  handleConfirm: () => void;
  handleClose: () => void;
  task: CustomITask;
  isCallTypeCaller: boolean;
};

const ConnectDialog: React.FC<Props> = ({
  anchorEl,
  currentIsCaller,
  contact,
  handleConfirm,
  handleClose,
  task,
  isCallTypeCaller,
}) => {
  const isOpen = Boolean(anchorEl);
  const id = isOpen ? 'simple-popover' : undefined;

  const getText = () => {
    const callType = contact && contact.rawJson && contact.rawJson.callType;
    if (!callType) return '';

    switch (callType) {
      case callTypes.child:
        return <Template code="ConnectDialog-Child" />;
      case callTypes.caller:
        if (currentIsCaller && isCallTypeCaller) return <Template code="ConnectDialog-Caller" />;
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

export default ConnectDialog;
