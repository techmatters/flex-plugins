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

/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTaskContext } from '@twilio/flex-ui';
import _ from 'lodash';

import TaskView from './TaskView';
import { Absolute } from '../styles';
import { populateCounselorsState } from '../states/configuration/actions';
import { RootState } from '../states';
import { getOfflineContactTask, getOfflineContactTaskSid } from '../states/contacts/offlineContactTask';
import { namespace } from '../states/storeNamespaces';
import { getUnsavedContact } from '../states/contacts/getUnsavedContact';
import asyncDispatch from '../states/asyncDispatch';
import { newLoadContactFromHrmForTaskAsyncAction } from '../states/contacts/saveContact';
import { getAseloFeatureFlags } from '../hrmConfig';
import { selectAnyContactIsSaving } from '../states/contacts/selectContactSaveStatus';
import selectCurrentOfflineContact from '../states/contacts/selectCurrentOfflineContact';
import { populateCounselors } from '../services/twilioWorkerService';

type Props = {
  task?: ITask;
};

let handleUnloadRef = null;

const CustomCRMContainer: React.FC<Props> = ({ task }) => {
  const dispatch = useDispatch();
  const selectedTaskSid = useSelector((state: RootState) => state.flex.view.selectedTaskSid);
  const currentOfflineContact = useSelector((state: RootState) => selectCurrentOfflineContact(state));
  const hasUnsavedChanges = useSelector((state: RootState) => {
    const { activeContacts, connectedCase } = state[namespace];
    return (
      Object.values(activeContacts.existingContacts).some(
        ({ savedContact, draftContact }) => !_.isEqual(savedContact, getUnsavedContact(savedContact, draftContact)),
      ) ||
      Object.values(connectedCase.cases).some(
        ({ caseWorkingCopy }) =>
          caseWorkingCopy.caseSummary || Object.values(caseWorkingCopy.sections ?? {}).some(section => section),
      ) ||
      selectAnyContactIsSaving(state)
    );
  });

  const populateCounselorList = (listPayload: Awaited<ReturnType<typeof populateCounselors>>) =>
    dispatch(populateCounselorsState(listPayload));
  const { enable_confirm_on_browser_close: enableConfirmOnBrowserClose } = getAseloFeatureFlags();
  useEffect(() => {
    const fetchPopulateCounselors = async () => {
      try {
        // TODO (Steve): Migrate this to a single async action
        const counselorsList = await populateCounselors();
        dispatch(populateCounselorsState(counselorsList));
      } catch (err) {
        // TODO (Gian): probably we need to handle this in a nicer way
        console.error(err.message);
      }
    };

    fetchPopulateCounselors();
  }, [populateCounselorList]);

  useEffect(() => {
    if (!currentOfflineContact) {
      asyncDispatch(dispatch)(newLoadContactFromHrmForTaskAsyncAction(getOfflineContactTask()));
    }
  }, [currentOfflineContact, dispatch]);

  useEffect(() => {
    if (!enableConfirmOnBrowserClose) {
      return () => undefined;
    }
    if (handleUnloadRef) {
      window.removeEventListener('beforeunload', handleUnloadRef);
    }
    handleUnloadRef = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'something';
        return 'something';
      }
      return undefined;
    };
    window.addEventListener('beforeunload', handleUnloadRef);
    return () => {
      if (handleUnloadRef) {
        window.removeEventListener('beforeunload', handleUnloadRef);
      }
    };
  }, [enableConfirmOnBrowserClose, hasUnsavedChanges]);

  const renderITask = selectedTaskSid && task;
  const renderOfflineContactTask = !selectedTaskSid && currentOfflineContact;

  return (
    <Absolute top="0" bottom="0" left="0" right="0">
      {renderITask && <TaskView task={task} key={`controller-${selectedTaskSid}`} />}
      {renderOfflineContactTask && (
        <TaskView task={getOfflineContactTask()} key={`controller-${getOfflineContactTaskSid()}`} />
      )}
    </Absolute>
  );
};

CustomCRMContainer.displayName = 'CustomCRMContainer';

export default withTaskContext(CustomCRMContainer);
