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
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import CallTypeButtons from './callTypeButtons';
import ProfileRouter, { ALL_PROFILE_ROUTES } from './profile/ProfileRouter';
import TabbedForms from './tabbedForms';
import CSAMReport from './CSAMReport/CSAMReport';
import { RootState } from '../states';
import type { CustomITask } from '../types/types';
import { newContactCSAMApi } from './CSAMReport/csamReportApi';
import findContactByTaskSid from '../states/contacts/findContactByTaskSid';
import { namespace } from '../states/storeNamespaces';
import { getCurrentBaseRoute, getCurrentTopmostRouteForTask } from '../states/routing/getRoute';
import { CSAMReportRoute, isRouteWithModalSupport } from '../states/routing/types';

type OwnProps = {
  task: CustomITask;
  featureFlags: { [flag: string]: boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const HrmForm: React.FC<Props> = ({ activeModal, routing, task, featureFlags, savedContact }) => {
  if (!routing) return null;
  const { route } = routing;

  const routes = [
    {
      activeModalRoutes: ALL_PROFILE_ROUTES,
      renderComponent: () => <ProfileRouter task={task} />,
    },
    // TODO: move hrm form search into it's own component and use it here so all routes are in one place
    {
      baseRoutes: ['tabbed-forms', 'search', 'contact', 'case'],
      renderComponent: () => (
        <TabbedForms
          task={task}
          contactId={savedContact?.id}
          csamClcReportEnabled={featureFlags.enable_csam_clc_report}
          csamReportEnabled={featureFlags.enable_csam_report}
        />
      ),
    },
    {
      baseRoutes: ['csam-report'],
      renderComponent: () => (
        <CSAMReport
          api={newContactCSAMApi(savedContact.id, task.taskSid, (routing as CSAMReportRoute).previousRoute)}
        />
      ),
    },
    { baseRoutes: ['select-call-type'], renderComponent: () => <CallTypeButtons task={task} /> },
  ];

  // Modals take precedence over routes
  const modalComponent = routes.find(m => m.activeModalRoutes?.includes(activeModal));
  if (modalComponent) return modalComponent.renderComponent();

  return routes.find(r => r.baseRoutes?.includes(route))?.renderComponent() || null;
};

HrmForm.displayName = 'HrmForm';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const routingState = state[namespace].routing;
  const { savedContact, metadata } = findContactByTaskSid(state, task.taskSid) ?? {};
  const baseRoute = getCurrentBaseRoute(routingState, task.taskSid);
  const activeModal =
    isRouteWithModalSupport(baseRoute) && baseRoute.activeModal?.length && baseRoute.activeModal[0].route;

  return { activeModal, routing: getCurrentTopmostRouteForTask(routingState, task.taskSid), savedContact, metadata };
};

const connector = connect(mapStateToProps);

export default connector(HrmForm);
