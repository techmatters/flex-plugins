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
import { Manager, Notifications, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';
import { useDispatch, useSelector } from 'react-redux';

import { createCallStatusSyncDocument } from '../../../utils/sharedState';
import { ConferenceNotifications } from '../../../conference/setUpConferenceActions';
import { conferenceApi } from '../../../services/ServerlessService';
import PhoneInputDialog from './PhoneInputDialog';
import { ConferenceButtonWrapper, ConferenceButton } from './styles';
import { RootState } from '../../../states';
import { setCallStatusAction, setIsDialogOpenAction, setPhoneNumberAction } from '../../../states/conferencing';
import { CallStatus, isCallStatusLoading } from '../../../states/conferencing/callStatus';
import { conferencingBase, namespace } from '../../../states/storeNamespaces';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const taskFromRedux = useSelector((state: RootState) => state[namespace][conferencingBase].tasks[task.taskSid]);

  const { isDialogOpen, callStatus, phoneNumber } = taskFromRedux ?? {};
  const dispatch = useDispatch();

  const setIsDialogOpen = (isOpen: boolean) => dispatch(setIsDialogOpenAction(task.taskSid, isOpen));
  const setCallStatus = (callStatus: CallStatus) => dispatch(setCallStatusAction(task.taskSid, callStatus));
  const setPhoneNumber = (number: string) => dispatch(setPhoneNumberAction(task.taskSid, number));

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  React.useEffect(() => {
    if (callStatus === 'busy' || callStatus === 'failed') {
      Notifications.showNotificationSingle(ConferenceNotifications.ErrorAddingParticipantNotification);
    }
  }, [callStatus]);

  const conferenceSid = conference?.source?.conferenceSid;
  const participants = conference?.source?.participants || [];

  if (!conferenceSid || !participants || !task) {
    return null;
  }

  const handleClick = async () => {
    try {
      const { status, callStatusSyncDocument } = await createCallStatusSyncDocument(({ data }) => {
        setCallStatus(data.CallStatus);
      });

      if (status === 'failure') {
        throw new Error('call to createCallStatusSyncDocument failed'); // throw error here so it's handled by below catch block
      }

      const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
      const to = phoneNumber;
      const label = `External party ${to}`;

      await Promise.all(
        conference.source.participants
          .filter(p => p.status === 'joined' && !['worker', 'agent', 'supervisor'].includes(p.participantType))
          .map(p =>
            conferenceApi.updateParticipant({
              callSid: p.callSid,
              conferenceSid: task.conference.conferenceSid,
              updates: { hold: true },
            }),
          ),
      );

      await conferenceApi.addParticipant({
        from,
        conferenceSid,
        to,
        callStatusSyncDocumentSid: callStatusSyncDocument.sid,
        label,
      });
    } catch (err) {
      console.error(`Error adding participant to call ${conferenceSid}: ${err}`);
      setCallStatus('no-call');
      Notifications.showNotificationSingle(ConferenceNotifications.ErrorAddingParticipantNotification);
    }
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <ConferenceButtonWrapper>
      <>
        <ConferenceButton
          disabled={
            !isLiveCall ||
            (participants && participants.filter(participant => participant.status === 'joined').length >= 4)
          }
          onClick={toggleDialog}
        >
          <AddIcCallRounded />
        </ConferenceButton>
        {isDialogOpen && (
          <PhoneInputDialog
            targetNumber={phoneNumber}
            setTargetNumber={setPhoneNumber}
            handleClick={handleClick}
            setIsDialogOpen={setIsDialogOpen}
            isLoading={isCallStatusLoading(callStatus)}
          />
        )}
      </>
      <span>
        <Template code="Conference" />
      </span>
    </ConferenceButtonWrapper>
  );
};

export default withTaskContext(ConferencePanel);
