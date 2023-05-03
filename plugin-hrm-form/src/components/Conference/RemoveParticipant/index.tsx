import React from 'react';
import { IconButton, Manager, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';
import type { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';

import { conferenceApi } from '../../../services/ServerlessService';

type Props = Partial<ParticipantCanvasChildrenProps>;

const RemoveParticipant: React.FC<Props> = ({ participant, task, ...props }) => {
  console.log('>>>>>>>> participant', participant);
  console.log('>>>>>>>> task', task);
  console.log('>>>>>>>> props', props);

  const handleClick = async () => {
    await conferenceApi.removeParticipant({ participantSid: participant.participantSid, taskSid: task.taskSid });
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
