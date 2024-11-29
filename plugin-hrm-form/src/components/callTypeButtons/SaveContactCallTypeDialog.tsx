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

import { Box, Row, HiddenText } from '../../styles';
import {
  CloseTaskDialog,
  CloseTaskDialogText,
  NonDataCallTypeDialogContainer,
  ConfirmButton,
  CancelButton,
  CloseButton,
} from './styles';
import TabPressWrapper from '../TabPressWrapper';

type OwnProps = {
  isOpen: boolean;
  isCallTask?: boolean;
  isEnabled: boolean;
  isInWrapupMode?: boolean;
  handleConfirm: () => Promise<any>;
  handleCancel: () => void;
};

type Props = OwnProps;

const SaveContactCallTypeDialog: React.FC<Props> = ({
  isOpen,
  isCallTask,
  isEnabled,
  isInWrapupMode,
  handleConfirm,
  handleCancel,
}) => (
  <CloseTaskDialog onClose={handleCancel} open={isOpen}>
    <TabPressWrapper>
      <NonDataCallTypeDialogContainer>
        <Box marginLeft="auto">
          <HiddenText id="CloseButton">
            <Template code="CloseButton" />
          </HiddenText>
          <CloseButton tabIndex={3} aria-label="CloseButton" onClick={handleCancel} />
        </Box>
        <CloseTaskDialogText>
          <Template code="NonDataCallTypeDialog-CloseConfirm" />
        </CloseTaskDialogText>
        <Box marginBottom="32px">
          <Row>
            <ConfirmButton
              disabled={!isEnabled}
              data-fs-id="Task-EndCallOrChat-Button"
              autoFocus
              tabIndex={1}
              onClick={handleConfirm}
            >
              {/* eslint-disable react/jsx-max-depth,no-nested-ternary */}
              <Template
                code={isInWrapupMode ? 'CallType-CloseContact' : isCallTask ? 'TaskHeaderEndCall' : 'TaskHeaderEndChat'}
              />
              {/* eslint-enable react/jsx-max-depth,no-nested-ternary */}
            </ConfirmButton>
            <CancelButton tabIndex={2} onClick={handleCancel} disabled={!isEnabled}>
              {/* eslint-disable-next-line react/jsx-max-depth */}
              <Template code="CancelButton" />
            </CancelButton>
          </Row>
        </Box>
      </NonDataCallTypeDialogContainer>
    </TabPressWrapper>
  </CloseTaskDialog>
);

SaveContactCallTypeDialog.displayName = 'SaveContactCallTypeDialog';

export default SaveContactCallTypeDialog;
