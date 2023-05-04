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
import { IconButton, Manager, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';
import type { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';

import { conferenceApi } from '../../../services/ServerlessService';

type Props = Partial<ParticipantCanvasChildrenProps>;

const RemoveParticipant: React.FC<Props> = ({ participant, task, ...props }) => {
  if (!participant?.callSid || !task?.conference?.conferenceSid) {
    return null;
  }

  const handleClick = async () => {
    await conferenceApi.removeParticipant({
      callSid: participant.callSid,
      conferenceSid: task.conference.conferenceSid,
    });
  };

  return (
    <IconButton
      icon="Hangup"
      onClick={handleClick}
      variant="secondary"
      // title={}
    />
  );
};

export default RemoveParticipant;
