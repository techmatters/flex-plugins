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
import MicNoneOutlined from '@material-ui/icons/MicNoneOutlined';
import MicOffOutlined from '@material-ui/icons/MicOffOutlined';

import { conferenceApi } from '../../../services/ServerlessService';
import { Column } from '../../../styles/HrmStyles';

type Props = TaskContextProps;

const ToggleMute: React.FC<Props> = ({ ...props }) => {
  const [isMuted, setIsMuted] = useState(false);

//   if (!task) {
//     return null;
//   }
  console.log('>>> callSid', props.call?.parameters?.CallSid);
  console.log('>>> ToggleMute conferenceSid', props.task?.attributes?.conference?.sid);
  console.log('>>> ToggleMute conferenceSid', props.task?.attributes?.conference?.conferenceSid);



  const handleClick = async () => {
    const toggleSound = !isMuted;
    // const result = await conferenceApi.updateParticipant({
    //   callSid: props.call?.parameters?.CallSid,
    //   conferenceSid: task.conference.conferenceSid,
    //   updateAttribute: 'hold',
    //   updateValue: !participant.onHold,
    // });
  console.log('>>> ToggleMute handleClick props', props);


    setIsMuted(toggleSound);
  };

//   const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <Column>
      <Button
        style={{ borderStyle: 'none', borderRadius: '50%', minWidth: 'auto' }}
        // disabled={!isLiveCall}
        onClick={handleClick}
        variant="secondary"
        // title={}
      >
        {isMuted ? <MicOffOutlined /> : <MicNoneOutlined />}
      </Button>
      <span>Micropnone</span>
    </Column>
  );
};

export default withTaskContext(ToggleMute);