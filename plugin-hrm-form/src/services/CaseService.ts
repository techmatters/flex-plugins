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
import { Case, Contact, SearchCaseResult } from '../types/types';

export async function createCase(contact: Contact, creatingWorkerSid: string, definitionVersion: DefinitionVersionId) {
  const { helpline, rawJson: contactForm } = contact;

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

  return fetchHrmApi('/cases', options);
}

export async function cancelCase(caseId: Case['id']) {
  const options = {
    method: 'DELETE',
  };

  await fetchHrmApi(`/cases/${caseId}`, options);
}

export async function updateCase(caseId: Case['id'], body: Partial<Case>): Promise<Case> {
  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  return fetchHrmApi(`/cases/${caseId}`, options);
}

export async function updateCaseStatus(caseId: Case['id'], status: Case['status']): Promise<Case> {
  const options = {
    method: 'PUT',
    body: JSON.stringify({ status }),
  };

  return fetchHrmApi(`/cases/${caseId}/status`, options);
}

export async function getCase(caseId: Case['id']): Promise<Case> {
  const options = {
    method: 'GET',
  };

  return fetchHrmApi(`/cases/${caseId}`, options);
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

  return fetchHrmApi(`/cases/search${queryParamsString}`, options);
}
