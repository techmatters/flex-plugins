/* eslint-disable sonarjs/prefer-immediate-return */
import fetchHrmApi from './fetchHrmApi';
import { getLimitAndOffsetParams } from './PaginationParams';

export async function createCase(caseRecord) {
  const options = {
    method: 'POST',
    body: JSON.stringify(caseRecord),
  };

  const responseJson = await fetchHrmApi('/cases', options);

  return responseJson;
}

/**
 * @returns {Promise<import('../types/types').SearchCaseResult>}
 */
export async function getCases(limit, offset) {
  const queryParams = getLimitAndOffsetParams(limit, offset);
  const responseJson = await fetchHrmApi(`/cases${queryParams}`);

  return responseJson;
}

export async function cancelCase(caseId) {
  const options = {
    method: 'DELETE',
  };

  await fetchHrmApi(`/cases/${caseId}`, options);
}

export async function updateCase(caseId, body) {
  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  const responseJson = await fetchHrmApi(`/cases/${caseId}`, options);

  return responseJson;
}

export async function getActivities(caseId) {
  return fetchHrmApi(`/cases/${caseId}/activities/`);
}

/**
 * @returns {Promise<import('../types/types').SearchCaseResult>}
 */
export async function searchCases(searchParams, limit, offset) {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/cases/search${queryParams}`, options);

  return responseJson;
}
