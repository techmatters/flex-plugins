/**
 * Copyright (C) 2021-2025 Technology Matters
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
import { Manager } from '@twilio/flex-ui';
import { HangUpBy } from 'hrm-types';

import { CustomITask, isTwilioTask } from './types/types';

export const newHangUpByStateManager = (manager: Manager = Manager.getInstance()) => {
  const storageKey = `hang_up_by_${manager.serviceConfiguration.flex_service_instance_sid}`;
  const readCurrentHangUpByState = (): Record<string, HangUpBy> => JSON.parse(localStorage.getItem(storageKey) ?? '{}');
  return {
    getForTask: (task: CustomITask): HangUpBy => {
      const currentState = readCurrentHangUpByState();
      if (!isTwilioTask(task)) {
        return undefined;
      }
      return currentState[task.sid];
      // localStorage.setItem(hangUpByStorageKey, JSON.stringify({ ...currentState, [task.sid]: 'Agent' }));
    },
    setForTask: (task: ITask, hangUpBy: HangUpBy) => {
      const currentState = readCurrentHangUpByState();
      localStorage.setItem(storageKey, JSON.stringify({ ...currentState, [task.sid]: hangUpBy }));
    },
  };
};
