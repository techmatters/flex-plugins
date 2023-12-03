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

import useRouting from '../../states/routing/hooks/useRouting';
import { RouterTask } from '../../types/types';

type OwnProps = {
  children: React.ReactNode;
  task: RouterTask;
  getBasePath: (params: { task?: RouterTask; taskSid?: string }) => string;
};

type Props = OwnProps & RouteComponentProps;

const RouterInit: React.FC<OwnProps> = ({ task, getBasePath }) => {
  const { taskSid, initRouting } = useRouting(task);
  const basePath = getBasePath({ task, taskSid });

  console.log('>>>RouterInit', { basePath });

  useEffect(() => {
    if (!taskSid) return;

    console.log('>>>RouterInit.useEffect', { taskSid, basePath });
    initRouting(basePath);
  }, [taskSid, basePath, initRouting]);

  return null;
};

const RenderChildren = ({ task, children }: OwnProps) => {
  const { taskSid } = useRouting(task);

  if (!taskSid) return null;

  return <>{children}</>;
};

const Router: React.FC<Props> = (props: Props) => {
  const { children, history } = props;

  return (
    <BaseRouter history={history}>
      <RouterInit {...props} />
      <RenderChildren {...props}>{children}</RenderChildren>
    </BaseRouter>
  );
};

// @ts-ignore
export default withRouter(Router);
