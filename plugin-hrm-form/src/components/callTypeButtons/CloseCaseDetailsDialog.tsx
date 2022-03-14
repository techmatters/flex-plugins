import React from 'react'
import TabPressWrapper from '../TabPressWrapper';
import { Box, Row, StyledNextStepButton, HiddenText } from '../../styles/HrmStyles';
import { Template } from '@twilio/flex-ui';
import { CloseButton } from '../../styles/callTypeButtons';
import { CloseDialogText } from '../../styles/case';

type Props = {
  setDialog: boolean

}

export default function CloseCaseDetailsDialog({setDialog}: Props) {
  return (
    <>
      {/* <CloseTaskDialog open={closeDialog} onClose={() => setCloseDialog(false)}> */}
      
      <TabPressWrapper>
        <Box textAlign="end" onClick={setDialog} tabIndex={3}>
          {/* () => setCloseDialog(false)    setDialog */}
          <HiddenText id="CloseButton">
            <Template code="CloseButton" />
          </HiddenText>
          <CloseButton aria-label="CloseButton" />
        </Box>
      <CloseDialogText>
        <Template code="BottomBar-SaveOnClose" />
      </CloseDialogText>
      <Row> 
        <StyledNextStepButton tabIndex={1} secondary onClick={handleClose} margin="15px auto">
        {/* onClick={props.handleClose}   handleClose */}
          <Template code="BottomBar-DontSave" />
        </StyledNextStepButton>
        <StyledNextStepButton tabIndex={2} onClick={handleUpdate} margin="15px auto">
          {/* onClick={handleUpdate}   handleUpdate */}
          <Template code="BottomBar-Save" />
        </StyledNextStepButton>
      </Row>
      <Box marginBottom="25px" />
      </TabPressWrapper>
    {/* </CloseTaskDialog> */}
  </>
  )
}