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

import { ITask } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import { savePendingContactToSharedState } from '../utils/sharedState';
import saveContactToSaferNet from './br';

type DualWriteFn = (task: ITask, payload: any) => Promise<void>;

type SaveContactByDefinitionVersion = {
  [definitionVersion: string]: DualWriteFn;
};

const saveContactByDefinitionVersion: SaveContactByDefinitionVersion = {
  'br-v1': saveContactToSaferNet,
};

export const saveContactToExternalBackend = async (task: ITask, payload: any) => {
  const { featureFlags, definitionVersion } = getConfig();
  if (!featureFlags.enable_dual_write) return;

  const saveContact = saveContactByDefinitionVersion[definitionVersion];
  if (saveContact) {
    try {
      await saveContact(task, payload);
    } catch (err) {
      savePendingContactToSharedState(task, payload, err);
    }
  }
};
