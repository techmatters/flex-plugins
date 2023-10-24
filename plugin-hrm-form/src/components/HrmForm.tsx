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
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import { CaseLayout } from '../styles/case';
import CallTypeButtons from './callTypeButtons';
import TabbedForms from './tabbedForms';
import Case from './case';
import CSAMReport from './CSAMReport/CSAMReport';
import Profile from './profile/Profile';
import { RootState } from '../states';
import type { CustomITask, Case as CaseForm, Contact } from '../types/types';
import { newContactCSAMApi } from './CSAMReport/csamReportApi';
import { completeTask } from '../services/formSubmissionHelpers';
import findContactByTaskSid from '../states/contacts/findContactByTaskSid';
import { namespace } from '../states/storeNamespaces';
import { ContactMetadata } from '../states/contacts/types';
import { submitContactFormAsyncAction } from '../states/contacts/saveContact';
import { newCloseModalAction } from '../states/routing/actions';
import { getCurrentTopmostRouteForTask } from '../states/routing/getRoute';
import Search from './search';

type OwnProps = {
  task: CustomITask;
  featureFlags: { [flag: string]: boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const HrmForm: React.FC<Props> = ({
  routing,
  task,
  featureFlags,
  savedContact,
  metadata,
  finaliseContact,
  closeModal,
}) => {
  if (!routing) return null;
  const { route } = routing;

  const onNewCaseSaved = async (caseForm: CaseForm) => {
    await finaliseContact(savedContact, metadata, caseForm);
    await completeTask(task);
  };

  switch (route) {
    case 'tabbed-forms':
      return (
        <TabbedForms
          task={task}
          contactId={savedContact?.id}
          csamClcReportEnabled={featureFlags.enable_csam_clc_report}
          csamReportEnabled={featureFlags.enable_csam_report}
        />
      );

    case 'case':
      return (
        <CaseLayout>
          <Case task={task} isCreating={true} onNewCaseSaved={onNewCaseSaved} />
        </CaseLayout>
      );

    case 'csam-report':
      return <CSAMReport api={newContactCSAMApi(savedContact.id, task.taskSid, routing.previousRoute)} />;
    case 'profile':
      return <Profile task={task} />;
    case 'search':
      return (
        <Search
          task={task}
          currentIsCaller={savedContact?.rawJson?.callType === callTypes.caller}
          handleSelectSearchResult={closeModal}
        />
      );
    case 'select-call-type':
    default:
      return <CallTypeButtons task={task} />;
  }
};

HrmForm.displayName = 'HrmForm';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const routingState = state[namespace].routing;
  const { savedContact, metadata } = findContactByTaskSid(state, task.taskSid) ?? {};

  return { routing: getCurrentTopmostRouteForTask(routingState, task.taskSid), savedContact, metadata };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => {
  return {
    finaliseContact: (contact: Contact, metadata: ContactMetadata, caseForm: CaseForm) =>
      dispatch(submitContactFormAsyncAction(task, contact, metadata, caseForm)),
    closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(HrmForm);
