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

import * as Flex from '@twilio/flex-ui';
import React from 'react';

import * as TransferHelpers from '../../transfer/transferTaskState';
import TransferButton from './TransferButton';
import AcceptTransferButton from './AcceptTransferButton';
import RejectTransferButton from './RejectTransferButton';
import RefreshButton from './RefreshButton';
import isErrorLoadingConversation from './isErrorLoadingConversation';

/**
 * Add the buttons used to initiate, accept and reject transfers (when it should), and removes the actions button if task is being transferred
 */
export const setUpTransferComponents = () => {
  Flex.MessageList.Content.add(<RefreshButton key="refresh-button" />, {
    if: props => !props || isErrorLoadingConversation(props.conversation),
  });

  Flex.TaskCanvasHeader.Content.add(<TransferButton key="transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferButton(props.task),
  });

  Flex.TaskCanvasHeader.Content.remove('actions', {
    if: props => TransferHelpers.isTransferring(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<AcceptTransferButton key="complete-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });

  Flex.TaskCanvasHeader.Content.add(<RejectTransferButton key="reject-transfer-button" />, {
    sortOrder: 1,
    if: props => TransferHelpers.shouldShowTransferControls(props.task),
  });
};
