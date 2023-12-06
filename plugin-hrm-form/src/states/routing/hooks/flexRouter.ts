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
import { Actions } from '@twilio/flex-ui';

import { TaskRoute } from '../types';

export const pushRoute = (route: TaskRoute) => {
  Actions.invokeAction('HistoryPush', route);
};

export const replaceRoute = (route: TaskRoute) => {
  Actions.invokeAction('HistoryReplace', route);
};

export const goBack = () => {
  Actions.invokeAction('HistoryGoBack');
};

export const goForward = () => {
  Actions.invokeAction('HistoryGoForward');
};

export const navigateToView = (viewName: string) => {
  Actions.invokeAction('NavigateToView', { viewName });
};

export default {
  pushRoute,
  replaceRoute,
  goBack,
  goForward,
  navigateToView,
};
