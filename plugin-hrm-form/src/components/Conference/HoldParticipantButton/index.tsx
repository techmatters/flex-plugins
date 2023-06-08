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
import { IconButton, TaskHelper } from '@twilio/flex-ui';
import type { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';

import { conferenceApi } from '../../../services/ServerlessService';

type Props = Partial<ParticipantCanvasChildrenProps>;

const HoldParticipantButton: React.FC<Props> = ({ participant, task, ...props }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!participant?.callSid || !task?.conference?.conferenceSid) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    await conferenceApi.updateParticipant({
      callSid: participant.callSid,
      conferenceSid: task.conference.conferenceSid,
      updateAttribute: 'hold',
      updateValue: !participant.onHold,
    });
    setIsLoading(false);
  };

  return (
    <>
      <IconButton
        icon={participant.onHold ? 'HoldOff' : 'Hold'}
        onClick={handleClick}
        variant="secondary"
        disabled={isLoading || !TaskHelper.canHold(task) || participant.status !== 'joined'}
        // title={}
      />
    </>
  );
};

export default HoldParticipantButton;
