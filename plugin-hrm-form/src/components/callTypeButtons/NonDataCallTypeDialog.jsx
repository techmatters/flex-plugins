import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { Box, Row } from '../../styles/HrmStyles';
import {
  CloseTaskDialog,
  CloseTaskDialogText,
  NonDataCallTypeDialogContainer,
  ConfirmButton,
  CancelButton,
  CloseButton,
} from '../../styles/callTypeButtons';
import TabPressWrapper from '../TabPressWrapper';

const NonDataCallTypeDialog = ({ isOpen, isCallTask, handleConfirm, handleCancel }) => (
  <CloseTaskDialog onClose={handleCancel} open={isOpen}>
    <TabPressWrapper>
      <NonDataCallTypeDialogContainer>
        <Box marginLeft="auto">
          <CloseButton tabIndex={3} aria-label="Close" onClick={handleCancel} />
        </Box>
        <CloseTaskDialogText>Are you sure?</CloseTaskDialogText>
        <Box marginBottom="32px">
          <Row>
            <ConfirmButton autoFocus tabIndex={1} onClick={handleConfirm}>
              {/* eslint-disable-next-line react/jsx-max-depth */}
              <Template code={isCallTask ? 'TaskHeaderEndCall' : 'TaskHeaderEndChat'} />
            </ConfirmButton>
            <CancelButton tabIndex={2} onClick={handleCancel}>
              Cancel
            </CancelButton>
          </Row>
        </Box>
      </NonDataCallTypeDialogContainer>
    </TabPressWrapper>
  </CloseTaskDialog>
);

NonDataCallTypeDialog.displayName = 'NonDataCallTypeDialog';
NonDataCallTypeDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isCallTask: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default NonDataCallTypeDialog;
