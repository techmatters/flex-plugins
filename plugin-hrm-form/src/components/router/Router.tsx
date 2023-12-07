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
import { AppRoutes, Contexts, isRouteWithContext } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { RouterTask } from '../../types/types';

type RouteConfigEntry<TProps> = {
  routes?: AppRoutes['route'][];
  contextRoutes?: AppRoutes['route'][];
  renderComponent: (props: TProps) => JSX.Element;
};

export type RouteConfig<TProps> = RouteConfigEntry<TProps>[];

type RouteConfigAny = RouteConfig<any>;

type OwnProps = {
  routeConfig: RouteConfigAny;
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

const getRootRoutes = (routeConfig: RouteConfigAny) =>
  routeConfig.filter(route => route.routes).flatMap(route => route.routes);

const getContextRoutes = (routeConfig: RouteConfigAny) =>
  routeConfig.filter(route => route.contextRoutes).flatMap(route => route.contextRoutes);

export const shouldHandleRoute = (routing: AppRoutes, routeConfig: RouteConfigAny, context?: Contexts) => {
  if (getRootRoutes(routeConfig).includes(routing.route)) return true;

  if (!context) return false;

  return (
    isRouteWithContext(routing) &&
    routing.context === context &&
    getContextRoutes(routeConfig).includes(routing.route as AppRoutes['route'])
  );
};

const Router: React.FC<Props> = props => {
  const { currentRoute, routeConfig } = props;

  return (
    routeConfig
      .find(({ routes, contextRoutes }) => routes?.includes(currentRoute) || contextRoutes?.includes(currentRoute))
      ?.renderComponent(props) || null
  );
};

export default connector(Router);
