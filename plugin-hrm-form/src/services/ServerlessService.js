/* eslint-disable camelcase */
import fetchProtectedApi from './fetchProtectedApi';
import { isNonDataCallType } from '../states/ValidationRules';
import { getConfig } from '../HrmFormPlugin';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @returns {Promise< {sid: string, fullName: string}[] >}
 */
export const populateCounselors = async () => {
  const { serverlessBaseUrl, helpline, currentWorkspace, token } = getConfig();
  const url = `${serverlessBaseUrl}/populateCounselors`;
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
    Token: token,
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

export const getTranslation = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getTranslation`;

  const translation = await fetchProtectedApi(url, { ...body, Token: token });
  return translation;
};

export const getMessages = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getMessages`;

  const messages = await fetchProtectedApi(url, { ...body, Token: token });
  return messages;
};

export const saveInsightsData = async (task, taskSID) => {
  const callType = task.callType.value;
  const hasCustomerData = !isNonDataCallType(callType);

  const conversations = {
    conversation_attribute_1: callType,
  };

  let customers = {};
  if (hasCustomerData) {
    const { childInformation } = task;
    customers = {
      gender: childInformation.gender.value,
      year_of_birth: childInformation.age.value,
    };
  }

  const { serverlessBaseUrl, currentWorkspace, token } = getConfig();
  const url = `${serverlessBaseUrl}/setTaskInsightsData`;
  const body = {
    workspaceSID: currentWorkspace,
    taskSID,
    conversations: JSON.stringify(conversations),
    customers: JSON.stringify(customers),
    Token: token,
  };

  const updatedTask = await fetchProtectedApi(url, body);
  return updatedTask;
};

export const transferChatStart = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/transferChatStart`;

  const newTask = await fetchProtectedApi(url, { ...body, Token: token });
  return newTask;
};

export const transferChatResolve = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/transferChatResolve`;

  const closedTask = await fetchProtectedApi(url, { ...body, Token: token });
  return closedTask;
};
