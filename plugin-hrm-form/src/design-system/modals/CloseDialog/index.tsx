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

import { DestructiveButton } from '../../../styles/buttons';
import { ConfirmDialog } from '../ConfirmDialog';

export const CloseDialog: React.FC<{
  openDialog: boolean;
  closeDialogHeader: string | React.ReactElement;
  closeDialogContent: string | React.ReactElement;
  onDiscardChanges: () => void;
  onCloseDialog: () => void;
}> = ({ openDialog, closeDialogHeader, closeDialogContent, onDiscardChanges, onCloseDialog }) => {
  return (
    <ConfirmDialog
      openDialog={openDialog}
      dialogHeader={closeDialogHeader}
      dialogContent={closeDialogContent}
      actionComponent={
        <DestructiveButton tabIndex={2} onClick={onDiscardChanges} style={{ marginLeft: '20px' }}>
          <Template code="Modals-CloseDialog-DiscardButton" />
        </DestructiveButton>
      }
      onCloseDialog={onCloseDialog}
    />
  );
};
