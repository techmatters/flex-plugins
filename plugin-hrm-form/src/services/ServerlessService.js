/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';
import { isNonDataCallType } from '../states/ValidationRules';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @param {{serverlessBaseUrl: string,
 *helpline: string,
 *currentWorkspace: string,
 *getSsoToken: () => string }} configuration
 * @returns {Promise< {sid: string, fullName: string}[] >}
 */
export const populateCounselors = async configuration => {
  const { serverlessBaseUrl, helpline, currentWorkspace, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/populateCounselors`;
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
    Token: getSsoToken(),
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

export const getTranslation = async (configuration, body) => {
  const { serverlessBaseUrl, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/getTranslation`;

  const translation = await fetchProtectedApi(url, { ...body, Token: getSsoToken() });
  return translation;
};

export const getMessages = async (configuration, body) => {
  const { serverlessBaseUrl, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/getMessages`;

  const messages = await fetchProtectedApi(url, { ...body, Token: getSsoToken() });
  return messages;
};

export const saveInsightsData = async (configuration, task, taskSID) => {
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

  const { serverlessBaseUrl, currentWorkspace, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/setTaskInsightsData`;
  const body = {
    workspaceSID: currentWorkspace,
    taskSID,
    conversations: JSON.stringify(conversations),
    customers: JSON.stringify(customers),
    Token: getSsoToken(),
  };

  const updatedTask = await fetchProtectedApi(url, body);
  return updatedTask;
};
