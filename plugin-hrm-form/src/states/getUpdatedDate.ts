/* eslint-disable prefer-destructuring */
import { differenceInMinutes } from 'date-fns';

import { Case, SearchAPIContact } from '../types/types';

const isSearchContact = (input: SearchAPIContact | Case): input is SearchAPIContact =>
  Boolean((<SearchAPIContact>input).overview);

/**
 * Takes a raw Case or SearchAPIContact object and calculates its updated date.
 * If the case/contact has last been updated within 10 minutes of creation, by the same user who created it,
 * or there is no updated date, it is not considered 'updated' and undefined is returned
 * @param input
 */
const getUpdatedDate = (input: SearchAPIContact | Case): Date | undefined => {
  let createdAt: Date;
  let updatedAt: Date | undefined;
  let createdBy: string;
  let updatedBy: string;
  if (isSearchContact(input)) {
    const { overview } = input;
    createdBy = overview.createdBy;
    createdAt = new Date(overview.dateTime);
    updatedBy = overview.updatedBy;
    updatedAt = overview.updatedAt ? new Date(overview.updatedAt) : undefined;
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
