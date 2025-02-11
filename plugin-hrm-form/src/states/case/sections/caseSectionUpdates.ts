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

import { Case } from '../../../types/types';
import {
  CaseSection,
  CaseSectionTypeSpecificData,
  createCaseSection,
  updateCaseSection,
} from '../../../services/caseSectionService';
import { HrmState } from '../..';
import { copyCaseSectionItem } from './copySection';
import { markCaseAsUpdating } from '../markCaseAsUpdating';

type CaseSectionUpdatePayload = {
  caseId: Case['id'];
  sections: {
    section: CaseSection;
    sectionType: string;
  }[];
};

const lookupEventTimestamp = (
  formDefinition: DefinitionVersion,
  caseSectionType: string,
  sectionData: CaseSectionTypeSpecificData,
): Date | undefined => {
  const sectionFormDefinition = formDefinition.caseSectionTypes[caseSectionType].form;
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
    caseSectionType: string,
    newSection: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
  ): Promise<CaseSectionUpdatePayload> => {
    const eventTimestamp = lookupEventTimestamp(formDefinition, caseSectionType, newSection);
    const copyToFields = formDefinition.caseSectionTypes[caseSectionType].form.filter(fd => fd.type === 'copy-to');
    const filteredEntries = Object.entries(newSection).filter(([key]) => !copyToFields.some(fd => fd.name === key));
    const filteredSection = Object.fromEntries(filteredEntries);

    const createTargetSection: Promise<CaseSectionUpdatePayload['sections'][number]> = (async () => ({
      section: await createCaseSection(caseId, caseSectionType, filteredSection, eventTimestamp),
      sectionType: caseSectionType,
    }))();

    const createCopySections: Promise<CaseSectionUpdatePayload['sections'][number]>[] = copyToFields.map(async fd => {
      if (fd.type === 'copy-to' && newSection[fd.name] === true) {
        const copied = copyCaseSectionItem({
          definition: formDefinition,
          fromSection: filteredSection,
          fromSectionType: caseSectionType,
          toSectionType: fd.target,
        });
        return {
          section: await createCaseSection(caseId, fd.target, copied, eventTimestamp),
          sectionType: fd.target,
        };
      }
      return undefined;
    });
    return {
      sections: (await Promise.all([createTargetSection, ...createCopySections])).filter(Boolean),
      caseId,
    };
  },
  (caseId: Case['id'], caseSectionType: string) =>
    ({
      caseId,
      sectionType: caseSectionType,
    } as const),
);

const UPDATE_CASE_SECTION_ACTION = 'case/section/UPDATE';

export const updateCaseSectionAsyncAction = createAsyncAction(
  UPDATE_CASE_SECTION_ACTION,
  async (
    caseId: Case['id'],
    caseSectionType: string,
    sectionId: string,
    update: CaseSectionTypeSpecificData,
    formDefinition: DefinitionVersion,
  ): Promise<CaseSectionUpdatePayload> => {
    const eventTimestamp = lookupEventTimestamp(formDefinition, caseSectionType, update);
    return {
      sections: [
        {
          sectionType: caseSectionType,
          section: await updateCaseSection(caseId, caseSectionType, sectionId, update, eventTimestamp),
        },
      ],
      caseId,
    };
  },
  (caseId: Case['id'], caseSectionType: string) => ({
    caseId,
    sectionType: caseSectionType,
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
      delete caseWorkingCopy?.sections?.[sectionType]?.existing?.[updatedCaseSection.sectionId];
    } else {
      delete caseWorkingCopy?.sections?.[sectionType]?.new;
    }
    sectionTypeMap[updatedCaseSection.sectionId] = { sectionType, ...updatedCaseSection };
  });
  return state;
};

export const caseSectionUpdateReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(createCaseSectionAsyncAction.pending, (state: HrmState, action: any) => {
      const { caseId } = action.meta;
      return markCaseAsUpdating(state, caseId, true);
    }),
    handleAction(createCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sections } = action.payload;
      return markCaseAsUpdating(updateCaseSections(state, caseId, sections), caseId, false);
    }),
    handleAction(createCaseSectionAsyncAction.rejected, (state: HrmState, action: any) => {
      const { caseId } = action.meta;
      return markCaseAsUpdating(state, caseId, false);
    }),
    handleAction(updateCaseSectionAsyncAction.pending, (state: HrmState, action: any) => {
      const { caseId } = action.meta;
      return markCaseAsUpdating(state, caseId, true);
    }),
    handleAction(updateCaseSectionAsyncAction.fulfilled, (state: HrmState, action) => {
      const { caseId, sections } = action.payload;
      return markCaseAsUpdating(updateCaseSections(state, caseId, sections), caseId, false);
    }),
    handleAction(updateCaseSectionAsyncAction.rejected, (state: HrmState, action: any) => {
      const { caseId } = action.meta;
      return markCaseAsUpdating(state, caseId, false);
    }),
  ]);
