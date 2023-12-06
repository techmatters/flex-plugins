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
import { RouteProps } from 'react-router-dom';
import { DefinitionVersion } from 'hrm-form-definitions';

import Switch from './router/Switch';
import CallTypeButtons from './callTypeButtons';
import ProfileRouter, { isProfileRoute } from './profile/ProfileRouter';
import TabbedForms from './tabbedForms';
import CSAMReport from './CSAMReport/CSAMReport';
import { RootState } from '../states';
import type { CustomITask, Case as CaseForm, Contact } from '../types/types';
import { newContactCSAMApi } from './CSAMReport/csamReportApi';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { namespace } from '../states/storeNamespaces';
import { ContactMetadata } from '../states/contacts/types';
import { createContactAsyncAction, submitContactFormAsyncAction } from '../states/contacts/saveContact';
import { newContact } from '../states/contacts/contactState';
import { getHrmConfig } from '../hrmConfig';
import { getCurrentTopmostRouteForTask } from '../states/routing/getRoute';
import { useRoutingState } from '../states/routing/hooks';
import type { CSAMReportRoute } from '../states/routing/types';

type OwnProps = {
  task: CustomITask;
  featureFlags: { [flag: string]: boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const HrmForm: React.FC<Props> = ({ routing, task, featureFlags, savedContact }) => {
  const routingState = useRoutingState(task);
  const { basePath, taskSid } = routingState;
  const { route } = routing;

  if (!basePath || !taskSid) return null;

  const modals = [
    {
      shouldRender: () => isProfileRoute(routingState),
      component: <ProfileRouter task={task} />,
    },
  ];

  const routes: RouteProps[] = [
    {
      path: '/tabbed-forms',
      render: () => (
        <TabbedForms
          task={task}
          contactId={savedContact?.id}
          csamClcReportEnabled={featureFlags.enable_csam_clc_report}
          csamReportEnabled={featureFlags.enable_csam_report}
        />
      ),
    },
    {
      path: '/',
      exact: true,
      render: () => <CallTypeButtons task={task} />,
    },
  ];

  const oldRoutes = [
    {
      routes: ['csam-report'],
      renderComponent: () => (
        <CSAMReport
          api={newContactCSAMApi(savedContact.id, task.taskSid, (routing as CSAMReportRoute).previousRoute)}
        />
      ),
    },
  ];

  const renderOldRoute = oldRoutes.find(r => r.routes?.includes(route))?.renderComponent || null;

  return renderOldRoute ? renderOldRoute() : <Switch task={task} modals={modals} routes={routes} />;
};

HrmForm.displayName = 'HrmForm';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { routing, configuration } = state[namespace];
  const { savedContact, metadata } = selectContactByTaskSid(state, task.taskSid) ?? {};

  return {
    routing: getCurrentTopmostRouteForTask(routing, task.taskSid),
    savedContact,
    metadata,
    definitionVersion: configuration.currentDefinitionVersion,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => {
  return {
    createContact: (definition: DefinitionVersion) =>
      dispatch(createContactAsyncAction(newContact(definition), getHrmConfig().workerSid, task.taskSid)),
    finaliseContact: (contact: Contact, metadata: ContactMetadata, caseForm: CaseForm) =>
      dispatch(submitContactFormAsyncAction(task, contact, metadata, caseForm)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(HrmForm);
