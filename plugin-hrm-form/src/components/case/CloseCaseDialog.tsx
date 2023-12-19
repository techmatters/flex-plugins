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
import WarningIcon from '@material-ui/icons/Warning';

import TabPressWrapper from '../TabPressWrapper';
import { Box, Row, HiddenText } from '../../styles/HrmStyles';
import { StyledNextStepButton } from '../../styles/buttons';
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
              secondary="true"
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
