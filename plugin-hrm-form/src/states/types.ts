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

import type { DefinitionVersion } from 'hrm-form-definitions';

import { Contact } from '../types/types';
import { ContactMetadata } from './contacts/types';

export type { DefinitionVersion };

// Action types
export const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
export const RECREATE_CONTACT_STATE = 'RECREATE_CONTACT_STATE';
export const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

export type InitializeContactStateAction = {
  type: typeof INITIALIZE_CONTACT_STATE;
  definitions: DefinitionVersion;
  initialContact: Contact;
  metadata: ContactMetadata;
  references: string[];
  recreated: boolean;
};

export type RemoveContactStateAction = {
  type: typeof REMOVE_CONTACT_STATE;
  taskId: string;
  contactId: string;
};
