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

import { CustomITask, isOfflineContactTask, ContactRawJson } from '../types/types';
import { getHrmConfig } from '../hrmConfig';
import { getWorkerAttributes } from './twilioWorkerService';

/**
 * Helper used to be the source of truth for the helpline value being passed to HRM and Insights
 * TODO: receive only contactForm.contactlessTask.helpline and contactForm.contactlessTask.createdOnBehalfOf
 */
export const getHelplineToSave = async (task: CustomITask, contactlessTask?: ContactRawJson['contactlessTask']) => {
  if (isOfflineContactTask(task) && contactlessTask) {
    if (contactlessTask.helpline) return contactlessTask.helpline;

    const targetWorkerSid = contactlessTask.createdOnBehalfOf as string;
    const targetWorkerAttributes = await getWorkerAttributes(targetWorkerSid);
    return targetWorkerAttributes.helpline;
  }
  const taskHelpline = isOfflineContactTask(task) ? '' : task.attributes.helpline;
  const { helpline: thisWorkerHelpline } = getHrmConfig();
  return taskHelpline || thisWorkerHelpline || '';
};
