/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';
import { TaskEntry } from 'states/contacts/reducer';
import { ITask } from '@twilio/flex-ui';

// How do we do this?  Twilio docs just define it as an Object
// See https://assets.flex.twilio.com/releases/flex-ui/1.18.0/docs/ITask.html
type TaskAttributes = any;

type InsightsAttributes = {
  conversations?: { [key: string]: string };
  customers?: { [key: string]: string };
}

const getSubcategories = (contactForm: TaskEntry) : string => {
  if (!contactForm || !contactForm.categories) return '';

  const { categories } = contactForm;

  return categories.splice(0, 3).join(';');
}

const buildCustomersObject = (taskAttributes: TaskAttributes, contactForm: TaskEntry) : InsightsAttributes => {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  if (!hasCustomerData) return { };

  const { childInformation } = contactForm;
  return {
    customers: {
      gender: childInformation.gender.toString(),
    },
  };
}

const buildConversationsObject = (taskAttributes: TaskAttributes, contactForm: TaskEntry) : InsightsAttributes => {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(contactForm.contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.channelType);

  if (!hasCustomerData) {
    return {
      conversations: {
        conversation_attribute_2: callType.toString(),
        communication_channel,
      }
    };
  }

  const { childInformation } = contactForm;

  return {
    conversations: {
      conversation_attribute_1: getSubcategories(contactForm).toString(),
      conversation_attribute_2: callType,
      conversation_attribute_3: childInformation.gender.toString(),
      conversation_attribute_4: childInformation.age.toString(),
      communication_channel,
    }
  };
}

const mergeAttributes = (previousAttributes: TaskAttributes, newAttributes : InsightsAttributes) : TaskAttributes => {
  return {
    ...previousAttributes,
    conversations: {
      ...previousAttributes.conversations,
      ...newAttributes.conversations,
    },
    customers: {
      ...previousAttributes.customers,
      ...newAttributes.customers,
    }
  };
}

const overrideAttributes = (attributes: TaskAttributes, contactForm: TaskEntry) : InsightsAttributes => {
  if (!attributes.isContactlessTask) {
    return { };
  }

  const dateTime = getDateTime(contactForm.contactlessTask);

  return {
    conversations: {
      date: dateTime.toString(),
    },
  };
};

/*
  We want a set of configurations that we can then apply
  These configurations take the twilioTask, contactForm and caseForm as inputs
  And they output an object with conversations and customers
  In the first step, maybe it's just a set of functions
  Then later we add the configuration language
*/
export async function saveInsightsData(twilioTask: ITask, contactForm: TaskEntry) {
  const conversations : InsightsAttributes = buildConversationsObject(twilioTask.attributes, contactForm);
  const customers : InsightsAttributes = buildCustomersObject(twilioTask.attributes, contactForm);
  const contactlessAttributes : InsightsAttributes = overrideAttributes(twilioTask.attributes, contactForm);
  const previousAttributes : TaskAttributes = twilioTask.attributes;
  const finalAttributes : TaskAttributes = mergeAttributes(mergeAttributes(mergeAttributes(previousAttributes, conversations), customers), contactlessAttributes);

  await twilioTask.setAttributes(finalAttributes);
}
