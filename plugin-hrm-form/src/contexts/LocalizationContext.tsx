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
import type { ITask } from '@twilio/flex-ui';

type LocalizationContextValue = {
  manager: any;
  isCallTask: (task: ITask) => boolean;
};

const initialState: LocalizationContextValue = {
  manager: { strings: null },
  isCallTask: () => false,
};

const LocalizationContext = React.createContext<LocalizationContextValue>(initialState);
LocalizationContext.displayName = 'LocalizationContext';

export const withLocalization = <P extends { localization: LocalizationContextValue }>(
  Component: React.ComponentType<P>,
) => {
  const LocalizedComponent: React.FC<Omit<P, 'localization'>> = props => (
    <LocalizationContext.Consumer>
      {context => <Component {...(props as P)} localization={context} />}
    </LocalizationContext.Consumer>
  );
  LocalizedComponent.displayName = 'LocalizedComponent';
  return LocalizedComponent;
};

export default LocalizationContext;
