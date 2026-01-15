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
import * as React from 'react';
import { useSelector } from 'react-redux';

import Exit from './QuickExit';
import End from './EndChat';
import { AppState } from '../../store/definitions';

const CloseChatButtons = () => {
  const { conversation, token, tasksSids } = useSelector((state: AppState) => ({
    conversation: state.chat?.conversation,
    token: state.session.token,
    tasksSids: state?.task?.tasksSids,
  }));
  if (!conversation || !token) {
    return null;
  }

  const finishTask = Boolean(tasksSids?.length);
  return (
    <>
      <End
        channelSid={conversation.sid}
        token={token}
        language="en"
        action={finishTask ? 'finishTask' : 'restartEngagement'}
      />
      <Exit channelSid={conversation.sid} token={token} language="en" finishTask={finishTask} />
      QuickExitDescription
    </>
  );
};

export default CloseChatButtons;
