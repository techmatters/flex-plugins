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

type RouteConfigEntryBase<TProps> = {
  renderComponent: (props: TProps) => JSX.Element;
};

type RouteConfigEntryRoutes<TProps> = RouteConfigEntryBase<TProps> & {
  routes: AppRoutes['route'][];
};
const isRouteConfigEntryRoutes = (
  routeConfigEntry: RouteConfigEntry<any>,
): routeConfigEntry is RouteConfigEntryRoutes<any> =>
  (routeConfigEntry as RouteConfigEntryRoutes<any>).routes !== undefined;

type RouteConfigEntryContextRoutes<TProps> = RouteConfigEntryBase<TProps> & {
  contextRoutes: AppRoutes['route'][];
};
const isRouteConfigEntryContextRoutes = (
  routeConfigEntry: RouteConfigEntry<any>,
): routeConfigEntry is RouteConfigEntryContextRoutes<any> =>
  (routeConfigEntry as RouteConfigEntryContextRoutes<any>).contextRoutes !== undefined;

type RouteConfigEntryShouldHandleRoute<TProps> = RouteConfigEntryBase<TProps> & {
  shouldHandleRoute: (routing: AppRoutes) => boolean;
};
const isRouteConfigEntryShouldHandleRoute = (
  routeConfigEntry: RouteConfigEntry<any>,
): routeConfigEntry is RouteConfigEntryShouldHandleRoute<any> =>
  (routeConfigEntry as RouteConfigEntryShouldHandleRoute<any>).shouldHandleRoute !== undefined;

type RouteConfigEntry<TProps> =
  | RouteConfigEntryRoutes<TProps>
  | RouteConfigEntryContextRoutes<TProps>
  | RouteConfigEntryShouldHandleRoute<TProps>;

export type RouteConfig<TProps> = RouteConfigEntry<TProps>[];

type RouteConfigAny = RouteConfig<any>;

type OwnProps = {
  routeConfig: RouteConfigAny;
  task: RouterTask;
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const routing = getCurrentTopmostRouteForTask(routingState, taskSid);

  return {
    routing,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const getRootRoutes = (routeConfig: RouteConfigAny) =>
  routeConfig
    .filter(route => isRouteConfigEntryRoutes(route))
    .flatMap((route: RouteConfigEntryRoutes<any>) => route.routes);

const getContextRoutes = (routeConfig: RouteConfigAny) =>
  routeConfig
    .filter(route => isRouteConfigEntryContextRoutes(route))
    .flatMap((route: RouteConfigEntryContextRoutes<any>) => route.contextRoutes);

const getShouldHandleRoutes = (routeConfig: RouteConfigAny) =>
  routeConfig
    .filter(route => isRouteConfigEntryShouldHandleRoute(route))
    .flatMap((route: RouteConfigEntryShouldHandleRoute<any>) => route);

const getShouldHandleRoute = (routeConfig: RouteConfigAny, routing: AppRoutes) =>
  getShouldHandleRoutes(routeConfig).find(route => route.shouldHandleRoute(routing));

const getHandleableRoute = (routeConfig: RouteConfigAny, routing: AppRoutes) => {
  const currentRoute = routing?.route.toString() as AppRoutes['route'];

  return routeConfig.find(
    configEntry =>
      (isRouteConfigEntryRoutes(configEntry) && configEntry.routes?.includes(currentRoute)) ||
      (isRouteConfigEntryContextRoutes(configEntry) && configEntry.contextRoutes?.includes(currentRoute)) ||
      (isRouteConfigEntryShouldHandleRoute(configEntry) && configEntry.shouldHandleRoute(routing)),
  );
};

export const shouldHandleRoute = (routing: AppRoutes, routeConfig: RouteConfigAny, context?: Contexts) => {
  const shouldHandleRoute = getShouldHandleRoute(routeConfig, routing);
  if (shouldHandleRoute) return true;

  if (getRootRoutes(routeConfig).includes(routing.route)) return true;

  if (!context) return false;

  return (
    isRouteWithContext(routing) &&
    routing.context === context &&
    getContextRoutes(routeConfig).includes(routing.route as AppRoutes['route'])
  );
};

const Router: React.FC<Props> = props => {
  const { routeConfig, routing } = props;
  return getHandleableRoute(routeConfig, routing)?.renderComponent(props) || null;
};

export default connector(Router);
