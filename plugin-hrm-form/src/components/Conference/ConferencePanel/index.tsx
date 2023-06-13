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
import { Button, ConferenceParticipant, Manager, TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';
import { useSelector, useDispatch } from 'react-redux';

import { conferenceApi } from '../../../services/ServerlessService';
import PhoneInputDialog from './PhoneInputDialog';
import { Column } from '../../../styles/HrmStyles';
import { conferencingBase, namespace, RootState } from '../../../states';
import { setIsDialogOpenAction, setIsLoadingAction, setPhoneNumberAction } from '../../../states/conferencing';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const { isDialogOpen, isLoading, phoneNumber } = useSelector(
    (state: RootState) => state[namespace][conferencingBase].tasks[task.taskSid],
  );
  const conferencesStates = useSelector((state: RootState) => state.flex.conferences.states);
  const dispatch = useDispatch();

  const setIsDialogOpen = (isOpen: boolean) => dispatch(setIsDialogOpenAction(task.taskSid, isOpen));
  const setIsLoading = (isLoading: boolean) => dispatch(setIsLoadingAction(task.taskSid, isLoading));
  const setPhoneNumber = (number: string) => dispatch(setPhoneNumberAction(task.taskSid, number));

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  if (!conference?.source?.conferenceSid || !task) {
    return null;
  }

  const { conferenceSid } = conference.source;

  const addNewParticipantToState = (newParticipant: any) => {
    const conferences = new Set();
    conferencesStates.forEach(conf => {
      if (conf.source.sid === conference.source.sid) {
        const { participants } = conf.source;

        const fakeParticipant = new ConferenceParticipant({
          ...newParticipant,
          mediaProperties: {
            ...newParticipant,
          },
          connecting: true,
          type: 'external',
        } as any);

        participants.push(fakeParticipant);
        conferences.add(conference.source);
      } else {
        conferences.add(conf);
      }
    });

    dispatch({ type: 'CONFERENCE_MULTIPLE_UPDATE', payload: { conferences } });
  };

  const handleClick = async () => {
    setIsLoading(true);
    const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    const to = phoneNumber;
    const result = await conferenceApi.addParticipant({ from, conferenceSid, to });
    addNewParticipantToState(result.participant);
    setIsLoading(false);
    setIsDialogOpen(false);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <form>
      <Column>
        <Button
          style={{ borderStyle: 'none', borderRadius: '50%', minWidth: 'auto' }}
          disabled={!isLiveCall || isLoading}
          onClick={toggleDialog}
          variant="secondary"
        >
          <AddIcCallRounded />
        </Button>
        {isDialogOpen && (
          <PhoneInputDialog
            targetNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleClick={handleClick}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
        <span>Conference</span>
      </Column>
    </form>
  );
};

export default withTaskContext(ConferencePanel);
