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
import { getInitializedCan, PermissionActions } from '.';
import { Contact } from '../types/types';
import { getHrmConfig } from '../hrmConfig';

const getCanEditInProgressContact = (contact: Contact, workerRoles:string[]): (() => boolean) => {
  // const worker = Manager.getInstance().workerClient
  console.log('>>> getCanEditInProgressContact', {workerRoles});
  if (!contact.finalizedAt) {
    // If the contact is a draft, we use the hardcoded rule that only its owner or creator can edit it
    const { workerSid } = getHrmConfig();
    const permitted = contact.twilioWorkerId === workerSid || contact.createdBy === workerSid 
    // || workerRoles.includes('supervisor');
    return () => permitted;
  }
  const initializedCan = getInitializedCan();
  return () => initializedCan(PermissionActions.EDIT_CONTACT, contact);
};

export default getCanEditInProgressContact;

