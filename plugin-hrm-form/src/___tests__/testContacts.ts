import { callTypes } from 'hrm-form-definitions';

import { HrmServiceContact } from '../types/types';
import { ContactMetadata } from '../states/contacts/types';
import { ReferralLookupStatus } from '../states/contacts/resourceReferral';

export const VALID_EMPTY_CONTACT: HrmServiceContact = {
  id: '',
  taskId: '',
  serviceSid: '',
  channelSid: '',
  number: '',
  createdBy: '',
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
    conversationMedia: [],
  },
  twilioWorkerId: '',
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
  },
};
