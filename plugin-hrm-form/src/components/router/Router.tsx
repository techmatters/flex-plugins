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
import React, { useEffect } from 'react';
import { Router as BaseRouter, RouteComponentProps } from 'react-router-dom';
import { withRouter } from '@twilio/flex-ui';

import { useTaskRouterInit, GetBasePath } from '../../states/routing/hooks';
import { RouterTask } from '../../types/types';

type OwnProps = {
  children: React.ReactNode;
  task: RouterTask;
  getBasePath: GetBasePath; // a function that returns the base path for the router based on the task
};

type Props = OwnProps & RouteComponentProps;

const RouterInit: React.FC<OwnProps> = ({ task, getBasePath }) => {
  // This hook must be called as a child of our new router component
  // so that all of our underlying react-router-dom hooks have access
  // to the router context
  useTaskRouterInit(task, getBasePath);

  return null;
};

const RenderChildren = ({ task, children }: OwnProps) => {
  //   // This hook must be called as a child of our new router component
  //   // so that all of our underlying react-router-dom hooks have access
  //   // to the router context
  //   const { current } = useRoutingState(task);

  //   if (!current) return null;

  return <>{children}</>;
};

const Router: React.FC<Props> = (props: Props) => {
  const { children, history } = props;

  /**
   * We hack our own react-router here but tie into the twilio router history object
   *
   * This depends on react-router v5.x and wil break if twilio upgrades to v6
   * which doesn't support nested routers. There are, obviously, other more
   * "flex-ui native" ways to handle this but this is the simplest way to get
   * at the hooks/context we need to make this work without a lot of bespoke
   * code. If flex ever upgrades to v6, they will also hopefully export the
   * hooks we need to make the rest of this system work instead of just the ancient
   * withRouter HOC.
   */
  return (
    <BaseRouter history={history}>
      <RouterInit {...props} />
      <RenderChildren {...props}>{children}</RenderChildren>
    </BaseRouter>
  );
};

// withRouter gives us access to the twilio react-router history object
// way down here in the component tree
export default withRouter(Router);
