import { standaloneTaskSid } from './types';

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
// We should start using these types in preference to strings for the relevant SIDs to reduce scope for silly errors.

// eslint-disable-next-line prettier/prettier
export type AccountSID =`AC${string}`;
export type WorkerSID = `WK${string}`;
export type TaskSID = typeof standaloneTaskSid | `${'WT'|'offline-contact-task'}${string}`;

