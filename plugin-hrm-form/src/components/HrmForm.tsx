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
import { useSelector } from 'react-redux';

import CallTypeButtons from './callTypeButtons';
import ProfileRouter, { isProfileRoute } from './profile/ProfileRouter';
import TabbedFormsRouter, { isTabbedFormsRoute } from './tabbedForms/TabbedFormsRouter';
import CSAMReport from './CSAMReport/CSAMReport';
import { RootState } from '../states';
import type { CustomITask } from '../types/types';
import { newContactCSAMApi } from './CSAMReport/csamReportApi';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { namespace } from '../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../states/routing/getRoute';
import type { CSAMReportRoute } from '../states/routing/types';
import Router, { RouteConfig } from './router/Router';

type Props = {
  task: CustomITask;
};

const HrmForm: React.FC<Props> = ({ task }) => {
  const routing = useSelector((state: RootState) =>
    getCurrentTopmostRouteForTask(state[namespace].routing, task.taskSid),
  );
  const { savedContact } = useSelector((state: RootState) => selectContactByTaskSid(state, task.taskSid) ?? {});
  if (!routing) return null;

  const routes: RouteConfig<Props> = [
    {
      shouldHandleRoute: () => isProfileRoute(routing),
      renderComponent: () => <ProfileRouter task={task} />,
    },
    {
      shouldHandleRoute: () => isTabbedFormsRoute(routing),
      renderComponent: () => <TabbedFormsRouter task={task} />,
    },
    {
      routes: ['csam-report'],
      renderComponent: () => (
        <CSAMReport
          api={newContactCSAMApi(savedContact.id, task.taskSid, (routing as CSAMReportRoute).previousRoute)}
        />
      ),
    },
    {
      routes: ['select-call-type'],
      renderComponent: () => <CallTypeButtons task={task} />,
    },
  ];

  return <Router task={task} routeConfig={routes} />;
};

HrmForm.displayName = 'HrmForm';

export default HrmForm;
