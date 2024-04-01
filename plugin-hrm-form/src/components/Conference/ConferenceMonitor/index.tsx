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
import { ConferenceParticipant } from '@twilio/flex-ui';
import '../../../types';
import { Conference } from '@twilio/flex-ui/src/state/Conferences';

import { conferenceApi } from '../../../services/ServerlessService';
import { hasTaskControl, isOriginalReservation, isTransferring } from '../../../transfer/transferTaskState';

const isJoinedWithEnd = (p: ConferenceParticipant) => p.status === 'joined' && p.mediaProperties.endConferenceOnExit;
const isJoinedWithoutEnd = (p: ConferenceParticipant) =>
  p.status === 'joined' && !p.mediaProperties.endConferenceOnExit;

type Props = TaskContextProps;

const ConferenceMonitor: React.FC<Props> = ({ conference, task }) => {
  const [updating, setUpdating] = React.useState(false);

  const conferenceSource: Partial<Conference> = conference?.source ?? {};

  const thisInstanceShouldMonitor =
    Boolean(task) && (hasTaskControl(task) || (isOriginalReservation(task) && isTransferring(task)));

  const shouldDisableEndConferenceOnExit = ({ participants, conferenceSid }: Partial<Conference>) =>
    thisInstanceShouldMonitor &&
    Boolean(participants && conferenceSid) &&
    participants.filter(p => p.status === 'joined').length > 2 &&
    participants.some(isJoinedWithEnd);

  const shouldEnableEndConferenceOnExit = ({ participants, conferenceSid }: Partial<Conference>) =>
    thisInstanceShouldMonitor &&
    Boolean(participants && conferenceSid) &&
    participants.filter(p => p.status === 'joined').length <= 2 &&
    participants.some(isJoinedWithoutEnd);

  const updateEndConferenceOnExit = React.useCallback(
    (endConferenceOnExit: boolean) => async (participant: ConferenceParticipant) => {
      const { conferenceSid } = conferenceSource;
      if (participant.connecting) return;
      // A participant should always have a callSid, but we are seeing some that don't, and we can't update them
      if (!participant.callSid) {
        console.error(
          'endConferenceOnExit: Participant missing callSid, abandoning attempt to update state',
          participant,
          conference,
        );
        return;
      }

      try {
        const startedOnHold = participant.onHold;

        await conferenceApi.updateParticipant({
          callSid: participant.callSid,
          conferenceSid,
          updates: { endConferenceOnExit, hold: false }, // if participant in on hold, endConferenceOnExit wont update
        });
        console.warn(
          `Set participant endConferenceOnExit ${endConferenceOnExit} for call ${participant.callSid}, conference ${conferenceSid}`,
          participant,
        );

        if (startedOnHold) {
          await conferenceApi.updateParticipant({
            callSid: participant.callSid,
            conferenceSid,
            updates: { hold: true },
          });
        }
      } catch (err) {
        console.error('Error setting participant endConferenceOnExit', participant, err);
      }
    },
    // Exhaustive deps mandates that we include 'conference', but that's only used for logging
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conferenceSource?.conferenceSid, conferenceSource?.participants, conferenceSource],
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
  React.useEffect(
    () => {
      const { participants, conferenceSid } = conferenceSource;
      if (!conferenceSid || !participants || updating) return;

      const monitorEffect = async () => {
        if (shouldDisableEndConferenceOnExit(conferenceSource)) {
          setUpdating(true);

          await Promise.all(participants.filter(isJoinedWithEnd).map(updateEndConferenceOnExit(false)));
          setUpdating(false);
        } else if (shouldEnableEndConferenceOnExit(conferenceSource)) {
          setUpdating(true);

          await Promise.all(participants.filter(isJoinedWithoutEnd).map(updateEndConferenceOnExit(true)));
          setUpdating(false);
        }
      };

      monitorEffect();
    },
    // Exhaustive deps mandates that we include 'updating', but this causes an infinite loop if updating the participant fails
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      conferenceSource?.conferenceSid,
      conferenceSource?.participants,
      shouldDisableEndConferenceOnExit,
      shouldEnableEndConferenceOnExit,
      updateEndConferenceOnExit,
    ],
  );

  return null;
};

export default ConferenceMonitor;
