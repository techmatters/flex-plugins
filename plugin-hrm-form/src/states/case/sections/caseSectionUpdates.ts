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
import {
  ApiCaseSection,
  CaseSectionTypeSpecificData,
  createCaseSection,
  updateCaseSection,
} from '../../../services/caseSectionService';
import { HrmState } from '../..';

type CaseSectionUpdatePayload = {
  caseId: Case['id'];
  sectionType: WellKnownCaseSection;
  section: ApiCaseSection;
};

const ADD_CASE_SECTION_ACTION = 'case/section/ADD';

export const createCaseSectionAsyncAction = createAsyncAction(
  ADD_CASE_SECTION_ACTION,
  async (
    caseId: Case['id'],
    sectionType: WellKnownCaseSection,
    newSection: CaseSectionTypeSpecificData,
  ): Promise<CaseSectionUpdatePayload> => {
    return {
      section: await createCaseSection(caseId, sectionType, newSection),
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

const UPDATE_CASE_SECTION_ACTION = 'case/section/UPDATE';

export const updateCaseSectionAsyncAction = createAsyncAction(
  UPDATE_CASE_SECTION_ACTION,
  async (
    caseId: Case['id'],
    sectionType: WellKnownCaseSection,
    sectionId: string,
    update: CaseSectionTypeSpecificData,
  ): Promise<CaseSectionUpdatePayload> => {
    return {
      section: await updateCaseSection(caseId, sectionType, sectionId, update),
      caseId,
      sectionType,
    };
  },
  (caseId: Case['id'], sectionType: string) => ({
    caseId,
    sectionType,
  }),
);

const updateCaseSections = (
  state: HrmState,
  caseId: Case['id'],
  sectionType: WellKnownCaseSection,
  updatedCaseSection: ApiCaseSection,
): HrmState => {
  const caseState = state.connectedCase.cases[caseId];
  if (!caseState) {
    console.warn(
      `Tried to update case section of type '${sectionType}' for missing case state (id: ${caseId})`,
      updatedCaseSection,
    );
    return state;
  }
  const { connectedCase: existingCase, caseWorkingCopy } = caseState;
  existingCase.sections = existingCase.sections || {};
  existingCase.sections[sectionType] = existingCase.sections[sectionType] || [];
  const list = existingCase.sections[sectionType];
  const index = list.findIndex(section => section.sectionId === updatedCaseSection.sectionId);
  if (index === -1) {
    list.push(updatedCaseSection);
    delete caseWorkingCopy?.sections?.[sectionType]?.new;
  } else {
    list[index] = updatedCaseSection;
    delete caseWorkingCopy?.sections?.[sectionType]?.existing?.[updatedCaseSection.sectionId];
  }
  return state;
};

export const caseSectionUpdateReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(createCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sectionType, section } = action.payload;
      return updateCaseSections(state, caseId, sectionType, section);
    }),
    handleAction(updateCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sectionType, section } = action.payload;
      return updateCaseSections(state, caseId, sectionType, section);
    }),
  ]);
