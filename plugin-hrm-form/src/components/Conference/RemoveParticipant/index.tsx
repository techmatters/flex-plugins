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
