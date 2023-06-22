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
import {
  ConferenceParticipant,
  Manager,
  Notifications,
  TaskContextProps,
  TaskHelper,
  Template,
  withTaskContext,
} from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';
import { useDispatch, useSelector } from 'react-redux';

import { ConferenceNotifications } from '../../../conference/setUpConferenceActions';
import { conferenceApi } from '../../../services/ServerlessService';
import PhoneInputDialog from './PhoneInputDialog';
import { StyledConferenceButtonWrapper, StyledConferenceButton } from './styles';
import { conferencingBase, namespace, RootState } from '../../../states';
import { setIsDialogOpenAction, setIsLoadingAction, setPhoneNumberAction } from '../../../states/conferencing';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const { isDialogOpen, isLoading, phoneNumber } = useSelector(
    (state: RootState) => state[namespace][conferencingBase].tasks[task.taskSid],
  );
  const dispatch = useDispatch();

  const setIsDialogOpen = (isOpen: boolean) => dispatch(setIsDialogOpenAction(task.taskSid, isOpen));
  const setIsLoading = (isLoading: boolean) => dispatch(setIsLoadingAction(task.taskSid, isLoading));
  const setPhoneNumber = (number: string) => dispatch(setPhoneNumberAction(task.taskSid, number));

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const conferenceSid = conference?.source?.conferenceSid;
  const participants = conference?.source?.participants || [];

  if (!conferenceSid || !participants || !task) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
      const to = phoneNumber;

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

      await conferenceApi.addParticipant({ from, conferenceSid, to });

      setIsDialogOpen(false);
    } catch (err) {
      console.error(`Error adding participant to call ${conferenceSid}: ${err}`);
      Notifications.showNotificationSingle(ConferenceNotifications.ErrorAddingParticipantNotification);
    } finally {
      setIsLoading(false);
    }
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <StyledConferenceButtonWrapper>
      <>
        <StyledConferenceButton
          disabled={
            !isLiveCall ||
            isLoading ||
            (participants && participants.filter(participant => participant.status === 'joined').length >= 4)
          }
          onClick={toggleDialog}
        >
          <AddIcCallRounded />
        </StyledConferenceButton>
        {isDialogOpen && (
          <PhoneInputDialog
            targetNumber={phoneNumber}
            setTargetNumber={setPhoneNumber}
            handleClick={handleClick}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
      </>
      <span>
        <Template code="Conference" />
      </span>
    </StyledConferenceButtonWrapper>
  );
};

export default withTaskContext(ConferencePanel);
