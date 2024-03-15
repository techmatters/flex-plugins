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
import { parseISO } from 'date-fns';

import { Case, WellKnownCaseSection } from '../../../types/types';
import {
  CaseSection,
  CaseSectionTypeSpecificData,
  createCaseSection,
  updateCaseSection,
} from '../../../services/caseSectionService';
import { HrmState } from '../..';
import { CaseSectionApi } from './api';
import { lookupApi } from './lookupApi';
import { copyCaseSectionItem } from './copySection';

type CaseSectionUpdatePayload = {
  caseId: Case['id'];
  sections: {
    section: CaseSection;
    sectionType: WellKnownCaseSection;
  }[];
};

const lookupEventTimestamp = (
  formDefinition: DefinitionVersion,
  sectionApi: CaseSectionApi,
  sectionData: CaseSectionTypeSpecificData,
): Date | undefined => {
  const sectionFormDefinition = sectionApi.getSectionFormDefinition(formDefinition);
  const eventTimestampSourceItem = sectionFormDefinition.find(fd => fd.metadata?.eventTimestampSource);
  return eventTimestampSourceItem && sectionData[eventTimestampSourceItem.name]
    ? parseISO(sectionData[eventTimestampSourceItem.name].toString())
    : undefined;
};

const ADD_CASE_SECTION_ACTION = 'case/section/ADD';

export const createCaseSectionAsyncAction = createAsyncAction(
  ADD_CASE_SECTION_ACTION,
  async (
    caseId: Case['id'],
    sectionApi: CaseSectionApi,
    newSection: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
  ): Promise<CaseSectionUpdatePayload> => {
    const eventTimestamp = lookupEventTimestamp(formDefinition, sectionApi, newSection);
    const copyToFields = sectionApi.getSectionFormDefinition(formDefinition).filter(fd => fd.type === 'copy-to');
    const filteredEntries = Object.entries(newSection).filter(([key]) => !copyToFields.some(fd => fd.name === key));
    const filteredSection = Object.fromEntries(filteredEntries);

    const createTargetSection: Promise<CaseSectionUpdatePayload['sections'][number]> = (async () => ({
      section: await createCaseSection(caseId, sectionApi.type, filteredSection, eventTimestamp),
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
          section: await createCaseSection(caseId, toApi.type, copied, eventTimestamp),
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
  (caseId: Case['id'], sectionApi: CaseSectionApi) =>
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
    sectionApi: CaseSectionApi,
    sectionId: string,
    update: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
  ): Promise<CaseSectionUpdatePayload> => {
    const eventTimestamp = lookupEventTimestamp(formDefinition, sectionApi, update);
    return {
      sections: [
        {
          sectionType: sectionApi.type,
          section: await updateCaseSection(caseId, sectionApi.type, sectionId, update, eventTimestamp),
        },
      ],
      caseId,
    };
  },
  (caseId: Case['id'], sectionApi: CaseSectionApi) => ({
    caseId,
    sectionType: sectionApi.type,
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
  caseState.sections = caseState.sections || {};
  const { caseWorkingCopy, sections } = caseState;

  updatedCaseSections.forEach(({ section: updatedCaseSection, sectionType }) => {
    sections[sectionType] = sections[sectionType] || {};
    const sectionTypeMap = sections[sectionType];
    const existingSection = sectionTypeMap[updatedCaseSection.sectionId];
    if (existingSection) {
      delete caseWorkingCopy.sections[sectionType].existing[updatedCaseSection.sectionId];
    } else {
      delete caseWorkingCopy.sections[sectionType].new;
    }
    sectionTypeMap[updatedCaseSection.sectionId] = { sectionType, ...updatedCaseSection };
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
