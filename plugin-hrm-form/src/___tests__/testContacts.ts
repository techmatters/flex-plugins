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

import { callTypes } from 'hrm-form-definitions';

import { Contact } from '../types/types';
import { ContactMetadata, LoadingStatus } from '../states/contacts/types';
import { ReferralLookupStatus } from '../states/contacts/resourceReferral';

export const VALID_EMPTY_CONTACT: Contact = {
  accountSid: 'AC',
  id: '',
  taskId: 'WT',
  serviceSid: '',
  channelSid: '',
  profileId: null,
  identifierId: null,
  number: '',
  createdBy: '',
  createdAt: '',
  updatedBy: '',
  updatedAt: '',
  queueName: '',
  channel: 'default',

  helpline: '',
  rawJson: {
    callType: callTypes.child,
    contactlessTask: {
      channel: 'voice',
      createdOnBehalfOf: undefined,
      date: '',
      time: '',
    },
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    categories: {},
  },
  conversationMedia: [],
  twilioWorkerId: 'WK',
  timeOfContact: '',
  conversationDuration: 0,
  csamReports: [],
};

export const VALID_EMPTY_METADATA: ContactMetadata = {
  startMillis: 0,
  endMillis: 0,
  categories: { gridView: false, expanded: {} },
  recreated: false,
  draft: {
    resourceReferralList: { resourceReferralIdToAdd: undefined, lookupStatus: ReferralLookupStatus.NOT_STARTED },
    dialogsOpen: {},
  },
  loadingStatus: LoadingStatus.LOADED,
};
