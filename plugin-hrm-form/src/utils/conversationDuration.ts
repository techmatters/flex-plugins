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

import { isNullOrUndefined } from './checkers';
import { isOfflineContactTask } from '../types/types';
import { ContactMetadata } from '../states/contacts/types';

export const fillEndMillis = (metadata: ContactMetadata): ContactMetadata => ({
  ...metadata,
  endMillis: metadata.endMillis || new Date().getTime(),
});

/**
 * Metrics will be invalid if:
 * - page was reloaded (form recreated and thus initial information will be lost)
 * - endMillis was not set
 * @param {ITask} task
 * @param {{ startMillis: number, endMillis: number, recreated: boolean }} metadata
 */
export const getConversationDuration = (task: ITask, { startMillis, endMillis, recreated }) => {
  if (isOfflineContactTask(task)) return null;

  const validMetrics = !recreated && !isNullOrUndefined(endMillis);

  if (!validMetrics) return null;

  const milisecondsElapsed = endMillis - startMillis;
  return Math.floor(milisecondsElapsed / 1000);
};
