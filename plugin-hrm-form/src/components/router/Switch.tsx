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
import React, { useCallback } from 'react';
import { Redirect, Switch as BaseSwitch, SwitchProps } from 'react-router-dom';
import isEqual from 'lodash/isEqual';

import useRouting from '../../states/routing/hooks/useRouting';
import { RouterTask } from '../../types/types';

type Props = SwitchProps & {
  task: RouterTask;
};

const Switch: React.FC<Props> = props => {
  const { children, task } = props;
  const { current, location } = useRouting(task);

  const shouldRedirectToCurrent = useCallback(() => {
    return current && !isEqual(location, current);
  }, [current, location]);

  if (!current) return null;

  return (
    <BaseSwitch {...props}>
      {shouldRedirectToCurrent() && <Redirect to={current} />}
      {children}
    </BaseSwitch>
  );
};

export default Switch;
