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

/* eslint-disable react/require-default-props */
import React from 'react';
import * as FlexWebChat from '@twilio/flex-webchat-ui';
import { Template } from '@twilio/flex-webchat-ui';

import { finishChatTask } from './end-chat-service';
import QuickExitIcon from './QuickExitIcon';
import { StyledEndButton, StyledCloseChatText, ExitIconWrapper } from './end-chat-styles';

type Props = {
  channelSid: string;
  token: string;
  language?: string;
  finishTask: boolean;
};

export default function QuickExit({ channelSid, token, language, finishTask }: Props) {
  const handleExit = async () => {
    const actions: Promise<unknown>[] = [];
    if (finishTask) {
      // Only if we started a task
      try {
        actions.push(finishChatTask(channelSid, token, language));
      } catch (error) {
        console.log(error);
      }
    }
    // Clear chat history and open a new location
    actions.push(FlexWebChat.Actions.invokeAction('RestartEngagement', { exit: true }));
    await Promise.all(actions);
  };

  return (
    <StyledEndButton style={{ backgroundColor: '#d22f2f' }} onClick={handleExit}>
      <StyledCloseChatText style={{ color: 'white' }}>
        <Template code="QuickExitButtonLabel" />
      </StyledCloseChatText>
      <ExitIconWrapper>
        <QuickExitIcon />
      </ExitIconWrapper>
    </StyledEndButton>
  );
}
