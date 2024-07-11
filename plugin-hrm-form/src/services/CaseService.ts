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
import { Case, CaseOverview, Contact, SearchCaseResult, WellKnownCaseSection } from '../types/types';
import { FetchOptions } from './fetchApi';
import { GenericTimelineActivity } from '../states/case/types';
import { convertApiCaseSectionToCaseSection, FullGenericCaseSection } from './caseSectionService';
import { convertApiContactToFlexContact } from './ContactService';

type ApiCase = Omit<Case, 'firstContact'> & { connectedContacts: Contact[] };

const convertApiCaseToFlexCase = (apiCase: ApiCase): Case => {
  if (!apiCase) {
    return apiCase;
  }
  const { connectedContacts, ...withoutConnectedContacts } = apiCase;
  const firstContact = connectedContacts?.[0];
  return {
    ...(firstContact ? { firstContact: convertApiContactToFlexContact(firstContact) } : {}),
    ...withoutConnectedContacts,
    id: apiCase.id.toString(), // coerce to string type, can be removed once API is aligned
  };
};

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

  return convertApiCaseToFlexCase(await fetchHrmApi('/cases', options));
}

export async function cancelCase(caseId: Case['id']) {
  const options = {
    method: 'DELETE',
  };

  await fetchHrmApi(`/cases/${caseId}`, options);
}

export async function updateCaseOverview(caseId: Case['id'], body: CaseOverview): Promise<Case> {
  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
  };

  return convertApiCaseToFlexCase(await fetchHrmApi(`/cases/${caseId}/overview`, options));
}

export async function updateCaseStatus(caseId: Case['id'], status: Case['status']): Promise<Case> {
  const options = {
    method: 'PUT',
    body: JSON.stringify({ status }),
  };

  return convertApiCaseToFlexCase(await fetchHrmApi(`/cases/${caseId}/status`, options));
}

export async function getCase(caseId: Case['id']): Promise<Case> {
  const options: FetchOptions = {
    method: 'GET',
    returnNullFor404: true,
  };
  const fromApi: ApiCase = await fetchHrmApi(`/cases/${caseId}`, options);
  return convertApiCaseToFlexCase(fromApi);
}

export type TimelineResult<TDate extends string | Date> = {
  activities: GenericTimelineActivity<any, TDate>[];
  count: number;
};

const isApiCaseSectionTimelineActivity = (
  activity: GenericTimelineActivity<any, string>,
): activity is GenericTimelineActivity<FullGenericCaseSection<string>, string> =>
  activity.activityType === 'case-section';

const isApiContactTimelineActivity = (
  activity: GenericTimelineActivity<any, string>,
): activity is GenericTimelineActivity<Contact, string> => activity.activityType === 'contact';

export async function getCaseTimeline(
  caseId: Case['id'],
  sectionTypes: WellKnownCaseSection[],
  includeContacts: boolean,
  paginationSettings: { offset: number; limit: number },
): Promise<TimelineResult<Date>> {
  const queryParamsString = getQueryParams(paginationSettings);
  const options = {
    method: 'GET',
  };
  const rawResult: TimelineResult<string> = await fetchHrmApi(
    `/cases/${caseId}/timeline${queryParamsString}&includeContacts=${includeContacts}&sectionTypes=${sectionTypes.join(
      ',',
    )}`,
    options,
  );
  return {
    ...rawResult,
    activities: rawResult.activities.map(timelineActivity => {
      let { activity } = timelineActivity;
      if (isApiCaseSectionTimelineActivity(timelineActivity)) {
        activity = convertApiCaseSectionToCaseSection(activity);
      } else if (isApiContactTimelineActivity(timelineActivity)) {
        activity = convertApiContactToFlexContact(activity);
      }
      return {
        ...timelineActivity,
        timestamp: new Date(timelineActivity.timestamp),
        activity,
      };
    }),
  };
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

  const fromApi: SearchCaseResult = await fetchHrmApi(`/cases/search${queryParamsString}`, options);

  return {
    ...fromApi,
    cases: fromApi.cases.map(convertApiCaseToFlexCase),
  };
}

export async function generalisedSearch(queryParams, listCasesPayload): Promise<SearchCaseResult> {
  const queryParamsString = getQueryParams(queryParams);

  const options = {
    method: 'POST',
    body: JSON.stringify(listCasesPayload),
  };

  const fromApi: SearchCaseResult = await fetchHrmApi(`/cases/generalisedSearch${queryParamsString}`, options);

  return {
    ...fromApi,
    cases: fromApi.cases.map(convertApiCaseToFlexCase),
  };
}
