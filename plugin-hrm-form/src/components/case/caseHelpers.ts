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

import { HelplineDefinitions } from 'hrm-form-definitions';

import { CustomITask, isOfflineContactTask } from '../../types/types';
import { TaskEntry } from '../../states/contacts/types';

/**
 * Gets date from the entry form (for a contact that hasn't been saved).
 * @param task Twilio Task Sid
 * @param form Entry Form
 */
export const getDateFromNotSavedContact = (task: CustomITask, form: TaskEntry): Date => {
  if (isOfflineContactTask(task)) {
    const { date: dateString, time } = form.contactlessTask;
    return new Date(`${dateString}T${time}:00`);
  }

  return new Date();
};

/**
 * Gets Helpline Data (Name, Case Manager, etc.)
 * @param helpline Helpline to filter
 * @param helplineInformation Helpline Information Collection
 */
export const getHelplineData = (helpline?: string, helplineInformation?: HelplineDefinitions) => {
  if (helpline && helplineInformation) return helplineInformation.helplines.find(x => x.value === helpline);
  return undefined;
};
