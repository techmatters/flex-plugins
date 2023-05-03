import React, { useState } from 'react';
import {
  Actions,
  ConferenceParticipant,
  IconButton,
  Manager,
  TaskContextProps,
  TaskHelper,
  Template,
  withTaskContext,
} from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import type { ParticipantTypes } from '@twilio/flex-ui/src/state/Participants/participants.types';

import { Column } from '../../../styles/HrmStyles';
import { addConferenceParticipant } from '../../../services/ServerlessService';
// import { RootState } from '../../../states';

type Props = TaskContextProps;

const ConferenceButton: React.FC<Props> = ({ task }) => {
  const [targetNumber, setTargetNumber] = useState('');
  // const dispatch = useDispatch();

  // const conferenceStates = useSelector((state: RootState) => state.flex.conferences.states);

  /*
   * const addConnectingParticipant = (
   *   targetConferenceSid: string,
   *   callSid: string,
   *   participantType: ParticipantTypes,
   * ) => {
   *   // const conferences = new Set();
   *   const conferences = Array.from(conferenceStates.values()).map(conf => {
   *     const currentConf = conf.source;
   *     if (currentConf.conferenceSid !== targetConferenceSid) {
   *       return conf;
   *     }
   *     const { participants } = currentConf;
   *     const fakeParticipant = new ConferenceParticipant(
   *       {
   *         connecting: true,
   *         type: participantType,
   *         // status: 'joined',
   *         channelSid: '', // ?? "UO500364c3da63ad60aaa765b280ea4adb"
   *         channelType: 'voice',
   *         interactionSid: '', // ??
   *         mediaProperties: {},
   *         participantSid: '',
   *         // routingProperties
   *       },
   *       callSid,
   *     );
   *   });
   *   dispatch({ type: 'CONFERENCE_MULTIPLE_UPDATE', payload: { conferences } });
   * };
   */

  const handleClick = async () => {
    const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    const to = targetNumber;
    const { taskSid } = task;
    const result = await addConferenceParticipant({ from, taskSid, to });
    console.log('>>>>>>> addConferenceParticipant resulted on:', result);
  };

  const handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTargetNumber(e.target.value);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <form>
      <Column>
        <label htmlFor="number-input">
          <Template code="Phone number" />
          <input type="text" id="number-input" value={targetNumber} onChange={handleNumberChange} />
        </label>
        <IconButton
          icon="Add"
          disabled={!isLiveCall}
          onClick={handleClick}
          variant="secondary"
          // title={}
        >
          <Template code="Add Participant" />
        </IconButton>
      </Column>
    </form>
  );
};

export default withTaskContext(ConferenceButton);
