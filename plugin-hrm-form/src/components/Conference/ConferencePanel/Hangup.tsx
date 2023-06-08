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

import React, { useState } from 'react';
import { Button, TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import { CallEnd as CallEndIcon } from '@material-ui/icons';

import { conferenceApi } from '../../../services/ServerlessService';
import { Column } from '../../../styles/HrmStyles';
import { CustomCallCanvasAction } from './styles';

type Props = TaskContextProps;

const Hangup: React.FC<Props> = ({ call, task }) => {
  if (!task || !call) {
    return null;
  }

  const handleClick = async () => {
    const result = await conferenceApi.removeParticipant({
      callSid: call?.parameters?.CallSid,
      conferenceSid: task?.attributes?.conference?.sid,
    });

    console.log('>>> handleClick workerParticipant removeParticipant', result);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <CustomCallCanvasAction>
      <Column>
        <Button
          style={{ borderStyle: 'none', borderRadius: '50%', minWidth: 'auto', backgroundColor: '#c81c25', color:'#fff' }}
          disabled={!isLiveCall}
          onClick={handleClick}
          variant="secondary"
          // title={}
        >
          <CallEndIcon fontSize="large" /> &nbsp;
        </Button>
        <span>Hang Up</span>
      </Column>
    </CustomCallCanvasAction>
  );
};

export default withTaskContext(Hangup);
