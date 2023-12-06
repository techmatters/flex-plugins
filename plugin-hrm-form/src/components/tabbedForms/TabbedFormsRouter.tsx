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
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { AppRoutes, isRouteWithContext } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { RouterTask } from '../../types/types';
import TabbedForms from './TabbedForms';

type OwnProps = {
  task: RouterTask;
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const currentRouteStack = getCurrentTopmostRouteForTask(routingState, taskSid);
  const currentRoute = currentRouteStack?.route.toString() as AppRoutes['route'];

  return {
    currentRoute,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

type TabbedFormRouteConfig = {
  routes?: AppRoutes['route'][];
  contextRoutes?: AppRoutes['route'][];
  renderComponent: (props: Props) => JSX.Element;
};

const TABBED_FORMS_ROUTES: TabbedFormRouteConfig[] = [
  {
    routes: ['tabbed-forms'],
    renderComponent: (props: Props) => <TabbedForms {...props} />,
  },
  {
    contextRoutes: ['search'],
    renderComponent: (props: Props) => <div>Search</div>,
  },
  {
    contextRoutes: ['contact'],
    renderComponent: (props: Props) => <div>Contact</div>,
  },
  {
    contextRoutes: ['case'],
    renderComponent: (props: Props) => <div>Case</div>,
  },
];

const rootTabbedFormsRoutes = TABBED_FORMS_ROUTES.filter(route => route.routes).flatMap(route => route.routes);
const contextTabbedFormsRoutes = TABBED_FORMS_ROUTES.filter(route => route.contextRoutes).flatMap(
  route => route.contextRoutes,
);

export const isTabbedFormsRoute = (routing: AppRoutes) => {
  if (rootTabbedFormsRoutes.includes(routing.route)) return true;

  return (
    isRouteWithContext(routing) &&
    routing.context === 'tabbed-forms' &&
    contextTabbedFormsRoutes.includes(routing.route as AppRoutes['route'])
  );
};

const TabbedFormsRouter: React.FC<Props> = props => {
  const { currentRoute } = props;

  return (
    TABBED_FORMS_ROUTES.find(
      ({ routes, contextRoutes }) => routes?.includes(currentRoute) || contextRoutes?.includes(currentRoute),
    )?.renderComponent(props) || null
  );
};

export default connector(TabbedFormsRouter);
