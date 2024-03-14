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
import { DefinitionVersion } from 'hrm-form-definitions';

import { Case, WellKnownCaseSection } from '../../../types/types';
import {
  ApiCaseSection,
  CaseSectionTypeSpecificData,
  createCaseSection,
  updateCaseSection,
} from '../../../services/caseSectionService';
import { HrmState } from '../..';
import { CaseSectionApi } from './api';
import { lookupApi } from './lookupApi';
import { copyCaseSectionItem } from './update';

type CaseSectionUpdatePayload = {
  caseId: Case['id'];
  sections: { section: ApiCaseSection; sectionType: WellKnownCaseSection }[];
};

const ADD_CASE_SECTION_ACTION = 'case/section/ADD';

export const createCaseSectionAsyncAction = createAsyncAction(
  ADD_CASE_SECTION_ACTION,
  async (
    caseId: Case['id'],
    newSection: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
    sectionApi: CaseSectionApi,
  ): Promise<CaseSectionUpdatePayload> => {
    const copyToFields = sectionApi.getSectionFormDefinition(formDefinition).filter(fd => fd.type === 'copy-to');
    const filteredEntries = Object.entries(newSection).filter(([key]) => !copyToFields.some(fd => fd.name === key));
    const filteredSection = Object.fromEntries(filteredEntries);

    const createTargetSection: Promise<CaseSectionUpdatePayload['sections'][number]> = (async () => ({
      section: await createCaseSection(caseId, sectionApi.type, filteredSection),
      sectionType: sectionApi.type,
    }))();

    const createCopySections: Promise<CaseSectionUpdatePayload['sections'][number]>[] = copyToFields.map(async fd => {
      if (fd.type === 'copy-to' && newSection[fd.name] === true) {
        const toApi = lookupApi(fd.target);
        const copied = copyCaseSectionItem({
          definition: formDefinition,
          fromSection: filteredSection,
          fromApi: sectionApi,
          toApi,
        });
        return {
          section: await createCaseSection(caseId, toApi.type, copied),
          sectionType: toApi.type,
        };
      }
      return undefined; // should never hit here because the items are already filtered, the if check is just for TS
    });
    return {
      sections: await Promise.all([createTargetSection, ...createCopySections]),
      caseId,
    };
  },
  (
    caseId: Case['id'],
    newSection: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
    sectionApi: CaseSectionApi,
  ) =>
    ({
      caseId,
      sectionType: sectionApi.type,
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
      sections: [{ sectionType, section: await updateCaseSection(caseId, sectionType, sectionId, update) }],
      caseId,
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
  updatedCaseSections: CaseSectionUpdatePayload['sections'],
): HrmState => {
  const caseState = state.connectedCase.cases[caseId];
  if (!caseState) {
    console.warn(`Tried to update case sections for missing case state (id: ${caseId})`, updatedCaseSections);
    return state;
  }
  const { connectedCase: existingCase, caseWorkingCopy } = caseState;
  existingCase.sections = existingCase.sections || {};
  updatedCaseSections.forEach(({ section: updatedCaseSection, sectionType }) => {
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
  });
  return state;
};

export const caseSectionUpdateReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(createCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sections } = action.payload;
      return updateCaseSections(state, caseId, sections);
    }),
    handleAction(updateCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sections } = action.payload;
      return updateCaseSections(state, caseId, sections);
    }),
  ]);
