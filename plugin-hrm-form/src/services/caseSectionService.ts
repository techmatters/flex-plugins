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

import { parseISO } from 'date-fns';

import { fetchHrmApi } from './fetchHrmApi';
import { Case, WellKnownCaseSection } from '../types/types';
import { WorkerSID } from '../types/twilio';

export type CaseSectionTypeSpecificData = Record<string, string | boolean>;

// Fully self describing case section that can be used outside the context of the containing case
export type FullGenericCaseSection<TDate extends string | Date> = {
  sectionType: WellKnownCaseSection;
  sectionId: string;
  sectionTypeSpecificData: Record<string, any>;
  createdAt: TDate;
  createdBy: WorkerSID;
  updatedAt?: TDate;
  updatedBy?: WorkerSID;
  eventTimestamp: TDate;
};

export type FullCaseSection = FullGenericCaseSection<Date>;

export type ApiCaseSection = Omit<FullGenericCaseSection<string>, 'sectionType'>;
export type CaseSection = Omit<FullCaseSection, 'sectionType'>;

export const convertApiCaseSectionToCaseSection = (
  section: FullGenericCaseSection<string> | ApiCaseSection,
): FullCaseSection | CaseSection => ({
  ...section,
  createdAt: parseISO(section.createdAt),
  updatedAt: section.updatedAt ? parseISO(section.updatedAt) : undefined,
  eventTimestamp: parseISO(section.eventTimestamp),
});

export async function createCaseSection(
  caseId: Case['id'],
  sectionType: string,
  sectionEntry: CaseSectionTypeSpecificData,
  eventTimestamp?: Date,
): Promise<CaseSection> {
  const rawResponse = await fetchHrmApi(`/cases/${caseId}/sections/${sectionType}`, {
    method: 'POST',
    body: JSON.stringify({
      sectionTypeSpecificData: sectionEntry,
      ...(eventTimestamp ? { eventTimestamp: eventTimestamp.toISOString() } : {}),
    }),
  });
  return convertApiCaseSectionToCaseSection(rawResponse);
}

export async function updateCaseSection(
  caseId: Case['id'],
  sectionType: string,
  sectionId: string,
  update: CaseSectionTypeSpecificData,
  eventTimestamp?: Date,
): Promise<CaseSection> {
  const rawResponse = await fetchHrmApi(`/cases/${caseId}/sections/${sectionType}/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      sectionTypeSpecificData: update,
      ...(eventTimestamp ? { eventTimestamp: eventTimestamp.toISOString() } : {}),
    }),
  });
  return convertApiCaseSectionToCaseSection(rawResponse);
}

export async function getAllCaseSections(caseId: Case['id'], sectionType: string): Promise<FullCaseSection[]> {
  const rawResponse = (await fetchHrmApi(`/cases/${caseId}/sections/${sectionType}`, {
    method: 'GET',
  })) as FullGenericCaseSection<string>[];
  return rawResponse.map(fcs => convertApiCaseSectionToCaseSection(fcs) as FullCaseSection);
}
