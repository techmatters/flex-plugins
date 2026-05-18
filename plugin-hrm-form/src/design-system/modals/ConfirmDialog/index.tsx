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

import { ConfirmDialogPaper, ConfirmDialogHeader, ConfirmDialogContent } from './styles';
import { TertiaryButton } from '../../../styles/buttons';
import { ButtonGroup } from '../styles';
import { getTemplate } from '../getTemplate';

export const ConfirmDialog: React.FC<{
  openDialog: boolean;
  dialogHeader: string | React.ReactElement;
  dialogContent: string | React.ReactElement;
  actionComponent: React.ReactElement;
  onCloseDialog: () => void;
}> = ({ openDialog, dialogHeader, dialogContent, actionComponent, onCloseDialog }) => {
  return (
    <ConfirmDialogPaper open={openDialog} onClose={onCloseDialog}>
      <ConfirmDialogHeader>{getTemplate(dialogHeader)}</ConfirmDialogHeader>
      <ConfirmDialogContent>{getTemplate(dialogContent)}</ConfirmDialogContent>
      <ButtonGroup>
        <TertiaryButton tabIndex={1} onClick={onCloseDialog}>
          <Template code="Modals-CloseDialog-CancelButton" />
        </TertiaryButton>
        {actionComponent}
      </ButtonGroup>
    </ConfirmDialogPaper>
  );
};
