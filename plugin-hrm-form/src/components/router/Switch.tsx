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
import { Redirect, Route, Switch as BaseSwitch, SwitchProps, RouteProps } from 'react-router-dom';
import isEqual from 'lodash/isEqual';

import { useRoutingState } from '../../states/routing/hooks';
import { RouterTask } from '../../types/types';

type ModalEntry = {
  shouldRender: () => boolean;
  component: JSX.Element;
};

type Props = SwitchProps & {
  task: RouterTask;
  routes: RouteProps[];
  modals?: ModalEntry[];
};

const Switch: React.FC<Props> = props => {
  const { children, modals, routes, task } = props;
  const { basePath, currentRoute, location } = useRoutingState(task);

  if (!currentRoute) return null;

  /**
   * This redirector is a workaround so that we can update the task link when
   * a user navigates back to a task to maintain our multi-tasking functionality.
   *
   * This could be accomplished in a more "flex-ui native" way by tying into the
   * afterAcceptTask listener and updating the task link there based on the state
   * using flex actions.
   *
   * That would, obviously not work for the standalone search page or any other
   * places where we are faking a task.
   */
  const shouldRedirectToCurrent = currentRoute && !isEqual(location, currentRoute);

  const currentModal = modals.find(modal => modal.shouldRender());
  if (currentModal) return currentModal.component;

  const renderRoutes = () => {
    return routes.map(route => {
      return <Route key={route.path.toString()} path={`${basePath}${route.path}`} render={route.render} />;
    });
  };

  return (
    <BaseSwitch {...props}>
      {shouldRedirectToCurrent && <Redirect to={currentRoute} />}
      {renderRoutes()}
      {children}
    </BaseSwitch>
  );
};

export default Switch;
