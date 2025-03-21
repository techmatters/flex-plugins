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
import React, { Dispatch, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
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
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';
import { selectAnyContactIsSaving } from '../states/contacts/selectContactSaveStatus';
import selectCurrentOfflineContact from '../states/contacts/selectCurrentOfflineContact';
import { populateCounselors } from '../services/twilioWorkerService';

type OwnProps = {
  task?: ITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

let handleUnloadRef = null;

const CustomCRMContainer: React.FC<Props> = ({
  selectedTaskSid,
  task,
  hasUnsavedChanges,
  populateCounselorList,
  currentOfflineContact,
  loadDraftOfflineContact,
}) => {
  const { enable_confirm_on_browser_close: enableConfirmOnBrowserClose } = getAseloFeatureFlags();
  useEffect(() => {
    const fetchPopulateCounselors = async () => {
      try {
        const counselorsList = await populateCounselors();
        populateCounselorList(counselorsList);
      } catch (err) {
        // TODO (Gian): probably we need to handle this in a nicer way
        console.error(err.message);
      }
    };

    fetchPopulateCounselors();
  }, [populateCounselorList]);

  useEffect(() => {
    if (!currentOfflineContact) {
      loadDraftOfflineContact();
    }
  }, [currentOfflineContact, loadDraftOfflineContact]);

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

const mapStateToProps = (state: RootState) => {
  const {
    [namespace]: { activeContacts, connectedCase },
    flex,
  } = state;
  const { selectedTaskSid } = flex.view;
  const currentOfflineContact = selectCurrentOfflineContact(state);
  const hasUnsavedChanges =
    Object.values(activeContacts.existingContacts).some(
      ({ savedContact, draftContact }) => !_.isEqual(savedContact, getUnsavedContact(savedContact, draftContact)),
    ) ||
    Object.values(connectedCase.cases).some(
      ({ caseWorkingCopy }) =>
        caseWorkingCopy.caseSummary || Object.values(caseWorkingCopy.sections ?? {}).some(section => section),
    ) ||
    selectAnyContactIsSaving(state);
  return {
    selectedTaskSid,
    currentOfflineContact,
    hasUnsavedChanges,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    loadDraftOfflineContact: () =>
      asyncDispatch(dispatch)(
        newLoadContactFromHrmForTaskAsyncAction(getOfflineContactTask(), getHrmConfig().workerSid),
      ),
    populateCounselorList: (listPayload: Awaited<ReturnType<typeof populateCounselors>>) =>
      dispatch(populateCounselorsState(listPayload)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default withTaskContext(connector(CustomCRMContainer));
