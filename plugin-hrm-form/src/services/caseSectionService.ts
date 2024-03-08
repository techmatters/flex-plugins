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

import { fetchHrmApi } from './fetchHrmApi';
import { Case } from '../types/types';
import { WorkerSID } from '../types/twilio';

export type CaseSectionTypeSpecificData = Record<string, string | boolean>;

export type ApiCaseSection = {
  sectionTypeSpecificData: CaseSectionTypeSpecificData;
  sectionId: string;
  createdAt: string;
  createdBy: WorkerSID;
  updatedBy?: WorkerSID;
  updatedAt?: string;
};

export async function createCaseSection(
  caseId: Case['id'],
  sectionType: string,
  sectionEntry: CaseSectionTypeSpecificData,
): Promise<ApiCaseSection> {
  return fetchHrmApi(`/cases/${caseId}/sections/${sectionType}`, {
    method: 'POST',
    body: JSON.stringify({ sectionTypeSpecificData: sectionEntry }),
  });
}

export async function updateCaseSection(
  caseId: Case['id'],
  sectionType: string,
  sectionId: string,
  update: CaseSectionTypeSpecificData,
): Promise<ApiCaseSection> {
  return fetchHrmApi(`/cases/${caseId}/sections/${sectionType}/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify({ sectionTypeSpecificData: update }),
  });
}
