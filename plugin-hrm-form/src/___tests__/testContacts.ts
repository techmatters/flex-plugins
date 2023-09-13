import { callTypes } from 'hrm-form-definitions';

import { HrmServiceContact } from '../types/types';

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
