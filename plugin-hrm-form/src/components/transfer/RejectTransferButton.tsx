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

/* eslint-disable react/prop-types */
import React from 'react';
import { TaskHelper, Template, ThemeProps } from '@twilio/flex-ui';

import { TransferButton } from '../../styles';
import { closeCallSelf } from '../../transfer/transferTaskState';

const handleRejectTransfer = async (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) return; // this case should never happen

  await closeCallSelf(task);
};

type Props = ThemeProps & { task?: ITask };

const RejectTransferButton: React.FC<Props> = ({ task }) => {
  return (
    <TransferButton onClick={() => handleRejectTransfer(task)}>
      <Template code="Transfer-RejectTransferButton" />
    </TransferButton>
  );
};

RejectTransferButton.displayName = 'RejectTransferButton';

export default RejectTransferButton;
