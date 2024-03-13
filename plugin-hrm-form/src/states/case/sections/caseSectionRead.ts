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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { Case, WellKnownCaseSection } from '../../../types/types';
import { FullCaseSection, getAllCaseSections } from '../../../services/caseSectionService';
import { HrmState } from '../..';

type CaseSectionsPayload = {
  caseId: Case['id'];
  sectionType: WellKnownCaseSection;
  sections: FullCaseSection[];
};

const GET_ALL_CASE_SECTIONS_ACTION = 'case/section/GET_ALL';

// eslint-disable-next-line import/no-unused-modules
export const newGetAllCaseSectionAsyncAction = createAsyncAction(
  GET_ALL_CASE_SECTIONS_ACTION,
  async (caseId: Case['id'], sectionType: WellKnownCaseSection): Promise<CaseSectionsPayload> => {
    return {
      sections: await getAllCaseSections(caseId, sectionType),
      caseId,
      sectionType,
    };
  },
  (caseId: Case['id'], sectionType: string) =>
    ({
      caseId,
      sectionType,
    } as const),
);

const loadCaseSections = (
  state: HrmState,
  caseId: Case['id'],
  sectionType: WellKnownCaseSection,
  loadedCaseSections: FullCaseSection[],
): HrmState => {
  const caseState = state.connectedCase.cases[caseId];
  if (!caseState) {
    console.warn(
      `Tried to load case section of type '${sectionType}' for missing case state (id: ${caseId})`,
      loadedCaseSections.map(cs => cs.sectionId),
    );
    return state;
  }
  caseState.timelines = caseState.timelines || {};
  caseState.timelines[sectionType] = loadedCaseSections.map(({ sectionId, eventTimestamp }) => ({
    timestamp: eventTimestamp,
    activityType: 'case-section-id',
    activity: { sectionId, sectionType },
  }));
  caseState.sections = caseState.sections || {};
  caseState.sections[sectionType] = caseState.sections[sectionType] || {};
  loadedCaseSections.forEach(section => {
    caseState.sections[sectionType][section.sectionId] = section;
  });
  return state;
};

export const caseSectionReadReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(newGetAllCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sectionType, sections } = action.payload;
      return loadCaseSections(state, caseId, sectionType, sections);
    }),
  ]);
