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

/* eslint-disable sonarjs/prefer-immediate-return */
import { DefinitionVersionId } from 'hrm-form-definitions';

import { fetchHrmApi } from './fetchHrmApi';
import { getQueryParams } from './PaginationParams';
import { Case, SearchCaseResult } from '../types/types';
import { unNestLegacyRawJson } from './ContactService';
import { TaskEntry as ContactForm } from '../states/contacts/types';

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
  console.log('>>>  createCase', contactForm, creatingWorkerSid, definitionVersion);
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
  console.log('>>> 6 CaseService updateCase', caseId, body);
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
