/* eslint-disable sonarjs/prefer-immediate-return */
import { DefinitionVersionId } from 'hrm-form-definitions';

import fetchHrmApi from './fetchHrmApi';
import { getQueryParams } from './PaginationParams';
import { Case, SearchCaseResult } from '../types/types';
import type { TaskEntry as ContactForm } from '../states/contacts/reducer';
import { unNestLegacyRawJson } from './ContactService';

const convertLegacyContacts = (apiCase: Case): Case => {
  if (!apiCase.connectedContacts || apiCase.connectedContacts.length === 0) {
    return apiCase;
  }
  const connectedContacts = (apiCase.connectedContacts ?? []).map(cc => ({
    ...cc,
    rawJson: unNestLegacyRawJson(cc.rawJson),
  }));

  return {
    ...apiCase,
    connectedContacts,
  };
};

export async function createCase(
  contactForm: ContactForm,
  creatingWorkerSid: string,
  definitionVersion: DefinitionVersionId,
) {
  const { helpline } = contactForm;

  const caseRecord = contactForm.contactlessTask?.createdOnBehalfOf
    ? {
        helpline,
        status: 'open',
        twilioWorkerId: contactForm.contactlessTask.createdOnBehalfOf,
        info: { definitionVersion, offlineContactCreator: creatingWorkerSid },
      }
    : {
        helpline,
        status: 'open',
        twilioWorkerId: creatingWorkerSid,
        info: { definitionVersion },
      };

  const options = {
    method: 'POST',
    body: JSON.stringify(caseRecord),
  };

  const responseJson = await fetchHrmApi('/cases', options);

  return convertLegacyContacts(responseJson);
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

  return convertLegacyContacts(responseJson);
}

export async function searchCases(searchParams, limit, offset): Promise<SearchCaseResult> {
  return listCases({ limit, offset }, searchParams);
}

export async function listCases(queryParams, listCasesPayload): Promise<SearchCaseResult> {
  const queryParamsString = getQueryParams(queryParams);

  const options = {
    method: 'POST',
    body: JSON.stringify(listCasesPayload),
  };

  const responseJson = await fetchHrmApi(`/cases/search${queryParamsString}`, options);

  return {
    ...responseJson,
    cases: responseJson.cases.map(convertLegacyContacts),
  };
}
