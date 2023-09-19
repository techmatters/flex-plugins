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
  console.log('>>>  4 updateCase', caseId, body);
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

type SignedURLMethod = 'getObject' | 'putObject' | 'deleteObject';
type ObjectType = 'case' | 'contact';

const generateCaseDocumentPath = (
  method: SignedURLMethod,
  type: ObjectType,
  caseId: string,
  bucket: string,
  key: string,
) =>
  // `/files/urls?method={getObject}&objectType=case&objectId=${caseId}&fileType=document&bucket=${bucket}&key=${key}`;
  `/files/urls?method=${method}&objectType=${type}&objectId=${caseId}&fileType=document&bucket=${bucket}&key=${key}`;

/**
 * Gets a file download url from the corresponding S3 bucket
 */
// export const getFileDownloadUrl = async (fileNameAtAws: string, fileName?: string) => {
//   console.log('>>> 2. getFileDownloadUrl start', fileNameAtAws, fileName);
//   const getFileName = formatFileNameAtAws(fileNameAtAws);
//   const body = { fileNameAtAws, fileName: fileName ? fileName : getFileName };
//   const response = await fetchProtectedApi('/getFileDownloadUrl', body);
//   console.log('>>> 2 getFileDownloadUrl response', response);
//   return response;
// };
/**
 * Removes the prefixed milliseconds from the fileName saved at AWS and returns only the original fileName
 * @param fileNameAtAws File Name of the resource at AWS
 * @returns Original file name
 */

// export const formatFileNameAtAws = fileNameAtAws =>
//   fileNameAtAws ? fileNameAtAws.substring(fileNameAtAws.indexOf('-') + 1) : '';

/**
 * Gets a file upload url to the corresponding S3 bucket
 */
// export const getFileUploadUrl = async (fileName: string, mimeType: string) => {
//   console.log('>>> 1. getFileUploadUrl start', fileName, mimeType);
//   const body = { fileName, mimeType };
//   const response = await fetchProtectedApi('/getFileUploadUrl', body);
//   console.log('>>> getFileUploadUrl response', response);
//   return response;
// };

/**
 * Deletes a file from the corresponding S3 bucket
 */
// export const deleteFile = async (fileName: string) => {
//   const body = { fileName };
//   const response = await fetchProtectedApi('/deleteFile', body);
//   return response;
// };
