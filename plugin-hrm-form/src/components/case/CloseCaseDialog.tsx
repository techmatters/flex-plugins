import React from 'react';
import { Template } from '@twilio/flex-ui';
import WarningIcon from '@material-ui/icons/Warning';

import TabPressWrapper from '../TabPressWrapper';
import { Box, Row, StyledNextStepButton, HiddenText } from '../../styles/HrmStyles';
import { CloseButton, CloseTaskDialog } from '../../styles/callTypeButtons';
import { CloseDialogText } from '../../styles/case';

type OwnProps = {
  openDialog?: boolean;
  setDialog?: () => void;
  handleDontSaveClose?: () => void;
  handleSaveUpdate?: () => void;
};
type Props = OwnProps;

const CloseCaseDialog: React.FC<Props> = ({ setDialog, handleDontSaveClose, handleSaveUpdate, openDialog }) => {
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
          <Row style={{ justifyContent: 'space-evenly' }}>
            <StyledNextStepButton
              tabIndex={1}
              secondary
              onClick={handleDontSaveClose}
              margin="15px 0"
              style={{ background: '#fff' }}
            >
              <Template code="BottomBar-DontSave" />
            </StyledNextStepButton>
            <StyledNextStepButton tabIndex={2} onClick={handleSaveUpdate} margin="15px 0">
              <Template code="BottomBar-Save" />
            </StyledNextStepButton>
          </Row>
          <Box marginBottom="25px" />
        </TabPressWrapper>
      </CloseTaskDialog>
    </>
  );
};

CloseCaseDialog.displayName = 'CloseCaseDialog';

// eslint-disable-next-line import/no-unused-modules
export default CloseCaseDialog;
