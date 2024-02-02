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

import { ITask, Manager } from '@twilio/flex-ui';

import { ContactState } from '../states/contacts/existingContacts';
import { getAseloFeatureFlags } from '../hrmConfig';
import asyncDispatch from '../states/asyncDispatch';
import { connectToCaseAsyncAction, updateContactInHrmAsyncAction } from '../states/contacts/saveContact';

/**
 * Ensures the contact is saved in HRM and disconnected from any case it might have been connected to
 * @param {*} contactState current contact (or undefined)
 * @param task
 */
export const saveFormSharedState = async (contactState: ContactState, { taskSid }: ITask): Promise<void> => {
  if (!getAseloFeatureFlags().enable_transfers) return;
  const { draftContact, savedContact } = contactState;
  const asyncDispatcher = asyncDispatch(Manager.getInstance().store.dispatch);
  if (draftContact) {
    await asyncDispatcher(updateContactInHrmAsyncAction(savedContact, draftContact, `${taskSid}-active`));
  }
};
