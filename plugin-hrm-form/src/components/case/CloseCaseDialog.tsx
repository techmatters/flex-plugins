import React from 'react';
import { Template } from '@twilio/flex-ui';
import WarningIcon from '@material-ui/icons/Warning';

import TabPressWrapper from '../TabPressWrapper';
import { Box, Row, StyledNextStepButton, HiddenText } from '../../styles/HrmStyles';
import { CloseButton, CloseTaskDialog } from '../../styles/callTypeButtons';
import { CloseDialogText } from '../../styles/case';

type Props = {
  setDialog: () => void;
  handleDontSaveClose: () => void;
  handleSaveUpdate: () => void;
  closeDialog: boolean;
};

// eslint-disable-next-line react/display-name
export default function CloseCaseDialog({ setDialog, handleDontSaveClose, handleSaveUpdate, closeDialog }: Props) {
  return (
    <>
      <CloseTaskDialog open={closeDialog} onClose={setDialog}>
        <TabPressWrapper>
          <Box textAlign="end" onClick={setDialog} tabIndex={3}>
            <HiddenText id="CloseButton">
              <Template code="CloseButton" />
            </HiddenText>
            <CloseButton aria-label="CloseButton" />
          </Box>
          <CloseDialogText>
            <p>
              <WarningIcon style={{ color: '#f6ca4a' }} />
            </p>
            <Template code="BottomBar-SaveOnClose" />
          </CloseDialogText>
          <Row>
            <StyledNextStepButton
              tabIndex={1}
              secondary
              onClick={handleDontSaveClose}
              margin="15px auto"
              style={{ background: '#fff' }}
            >
              <Template code="BottomBar-DontSave" />
            </StyledNextStepButton>
            <StyledNextStepButton tabIndex={2} onClick={handleSaveUpdate} margin="15px auto">
              <Template code="BottomBar-Save" />
            </StyledNextStepButton>
          </Row>
          <Box marginBottom="25px" />
        </TabPressWrapper>
      </CloseTaskDialog>
    </>
  );
}
