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
import type { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';
import { useDispatch, useSelector } from 'react-redux';

import { conferenceApi } from '../../../services/ServerlessService';
import { RootState } from '../../../states';
import { addParticipantLabelAction } from '../../../states/conferencing';
import { ParticipantLabelContainer, ParticipantLabelText } from './styles';
import { conferencingBase, namespace } from '../../../states/storeNamespaces';

type Props = ParticipantCanvasChildrenProps;

const ParticipantLabel: React.FC<Props> = ({ participant, task }) => {
  const participantLabel = useSelector(
    (state: RootState) =>
      state[namespace][conferencingBase].tasks[task?.taskSid]?.participantsLabels[participant?.participantSid],
  );
  const dispatch = useDispatch();

  const addParticipantLabel = (participantLabel: string) =>
    dispatch(addParticipantLabelAction(task.taskSid, participant.participantSid, participantLabel));

  React.useEffect(() => {
    const getParticipantLabel = async () => {
      const result = await conferenceApi.getParticipant({
        callSid: participant?.callSid,
        conferenceSid: task.conference?.conferenceSid,
      });
      addParticipantLabel(result.participant.label);
    };

    if (!participantLabel) {
      getParticipantLabel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ParticipantLabelContainer>
      <ParticipantLabelText className="ParticipantCanvas-Name">{participantLabel || '...'}</ParticipantLabelText>
    </ParticipantLabelContainer>
  );
};

export default ParticipantLabel;
