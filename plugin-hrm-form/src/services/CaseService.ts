/* eslint-disable sonarjs/prefer-immediate-return */
import fetchHrmApi from './fetchHrmApi';
import { getLimitAndOffsetParams } from './PaginationParams';
import { getConfig } from '../HrmFormPlugin';
import { Case, SearchCaseResult, isOfflineContactTask, CustomITask } from '../types/types';
import type { TaskEntry as ContactForm } from '../states/contacts/reducer';

export async function createCase(task: CustomITask, contactForm: ContactForm) {
  const { workerSid, definitionVersion } = getConfig();
  const { helpline } = contactForm;

  const caseRecord = isOfflineContactTask(task)
    ? {
        helpline,
        status: 'open',
        twilioWorkerId: contactForm.contactlessTask.createdOnBehalfOf,
        info: { definitionVersion, offlineContactCreator: workerSid },
      }
    : {
        helpline,
        status: 'open',
        twilioWorkerId: workerSid,
        info: { definitionVersion },
      };

  const options = {
    method: 'POST',
    body: JSON.stringify(caseRecord),
  };

  const responseJson = await fetchHrmApi('/cases', options);

  return responseJson;
}

export async function getCases(limit: number, offset: number, helpline?: string): Promise<SearchCaseResult> {
  const queryParams = getLimitAndOffsetParams(limit, offset, helpline);
  const responseJson = await fetchHrmApi(`/cases${queryParams}`);

  return responseJson;
}

export async function cancelCase(caseId: Case['id']) {
  const options = {
    method: 'DELETE',
  };

  await fetchHrmApi(`/cases/${caseId}`, options);
}

export async function updateCase(caseId: Case['id'], body: Partial<Case>) {
  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  const responseJson = await fetchHrmApi(`/cases/${caseId}`, options);

  return responseJson;
}

export async function searchCases(searchParams, limit, offset): Promise<SearchCaseResult> {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/cases/search${queryParams}`, options);

  return responseJson;
}
