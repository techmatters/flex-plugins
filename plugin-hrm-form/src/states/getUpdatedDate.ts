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

/* eslint-disable prefer-destructuring */
import { differenceInMinutes } from 'date-fns';

import { Case, Contact } from '../types/types';

const isSearchContact = (input: Contact | Case): input is Contact => Boolean((<Contact>input).rawJson);

/**
 * Takes a raw Case or Contact object and calculates its updated date.
 * If the case/contact has last been updated within 10 minutes of creation, by the same user who created it,
 * or there is no updated date, it is not considered 'updated' and undefined is returned
 * @param input
 */
const getUpdatedDate = (input: Contact | Case): Date | undefined => {
  let createdAt: Date;
  let updatedAt: Date | undefined;
  let createdBy: string;
  let updatedBy: string;
  if (isSearchContact(input)) {
    ({ createdBy, updatedBy } = input);
    createdAt = new Date(input.timeOfContact);
    updatedAt = input.updatedAt ? new Date(input.updatedAt) : undefined;
  } else {
    createdBy = input.twilioWorkerId;
    createdAt = new Date(input.createdAt);
    updatedBy = input.twilioWorkerId;
    updatedAt = input.updatedAt ? new Date(input.updatedAt) : undefined;
  }
  return updatedAt &&
    !isNaN(updatedAt.valueOf()) &&
    (differenceInMinutes(updatedAt, createdAt) > 10 || createdBy !== updatedBy)
    ? updatedAt
    : undefined;
};

export default getUpdatedDate;
