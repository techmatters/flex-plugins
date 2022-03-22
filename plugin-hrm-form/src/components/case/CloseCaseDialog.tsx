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
  openDialog: boolean;
};
export default function CloseCaseDialog({ setDialog, handleDontSaveClose, handleSaveUpdate, openDialog }: Props) {
  return (
    <>
      <CloseTaskDialog open={openDialog} onClose={setDialog}>
        <TabPressWrapper>
          <Box textAlign="end" onClick={setDialog} tabIndex={3}>
            <HiddenText id="CloseButton">
              <Template code="CloseButton" />
            </HiddenText>
            <CloseButton aria-label="CloseButton" />
          </Box>
          <CloseDialogText>
            <WarningIcon style={{ color: '#f6ca4a' }} /> <br />
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

CloseCaseDialog.displayName = 'CloseCaseDialog';
