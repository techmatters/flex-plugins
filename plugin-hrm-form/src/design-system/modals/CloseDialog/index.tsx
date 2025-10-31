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

import { CloseDialogPaper, CloseDialogHeader, CloseDialogContent } from './styles';
import { Box } from '../../../styles/layout';
import { DestructiveButton, TertiaryButton } from '../../../styles/buttons';
import { ButtonGroup } from '../styles';

export const CloseDialog: React.FC<{
  openDialog: boolean;
  closeDialogHeader: string;
  closeDialogContent: string;
  onDiscardChanges: () => void;
  onCloseDialog: () => void;
}> = ({ openDialog, closeDialogHeader, closeDialogContent, onDiscardChanges, onCloseDialog }) => {
  return (
    <CloseDialogPaper open={openDialog} onClose={onCloseDialog}>
      <Box padding="30px">
        <CloseDialogHeader>
          <Template code={closeDialogHeader} />
        </CloseDialogHeader>
        <Box padding="20px 0">
          <CloseDialogContent>
            <Template code={closeDialogContent} />
          </CloseDialogContent>
        </Box>
        <ButtonGroup>
          <TertiaryButton tabIndex={1} onClick={onCloseDialog}>
            <Template code="Cancel" />
          </TertiaryButton>
          <DestructiveButton tabIndex={2} onClick={onDiscardChanges} style={{ margin: '0 15px' }}>
            <Template code="Discard Changes" />
          </DestructiveButton>
        </ButtonGroup>
      </Box>
    </CloseDialogPaper>
  );
};
