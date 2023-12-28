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
import { TaskContextProps, TaskHelper, Template, withTaskContext, Actions } from '@twilio/flex-ui';
import DialpadOutlined from '@material-ui/icons/DialpadOutlined';
import CloseOutlined from '@material-ui/icons/CloseOutlined';

import { ConferenceButtonWrapper, ConferenceButton } from './styles';

type Props = TaskContextProps & { dialpadState?: {} | null };

const ToogleDialpad: React.FC<Props> = ({ call, task, conference, dialpadState }) => {
  if (!task || !call || !conference) {
    return null;
  }

  const isDialpadOpen = Boolean(dialpadState);

  const handleClick = async () => {
    await Actions.invokeAction('ToggleDTMFDialpad', { task, sid: task.sid, open: !isDialpadOpen });
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <ConferenceButtonWrapper>
      <ConferenceButton disabled={!isLiveCall} onClick={handleClick}>
        {dialpadState ? <CloseOutlined /> : <DialpadOutlined />}
      </ConferenceButton>
      <span>
        <Template code="Dial" />
      </span>
    </ConferenceButtonWrapper>
  );
};

export default withTaskContext(ToogleDialpad);
