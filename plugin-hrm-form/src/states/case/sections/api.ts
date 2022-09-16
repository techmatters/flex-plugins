import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { CaseInfo, CaseItemEntry } from '../../../types/types';
import { CaseWorkingCopy } from '../reducer';

export type CaseUpdater = (original: CaseInfo, temporaryInfo: CaseItemEntry) => CaseInfo;

export type CaseSectionApi<T> = {
  readonly label: string; // for logging only
  getSectionItemById: (caseInfo: CaseInfo, id: string) => T | undefined;
  getMostRecentSectionItem: (caseInfo: CaseInfo) => T | undefined;
  toForm: (section: T) => CaseItemEntry;
  upsertCaseSectionItemFromForm: CaseUpdater;
  getSectionFormDefinition: (definitions: DefinitionVersion) => FormDefinition;
  getSectionLayoutDefinition: (definitions: DefinitionVersion) => LayoutDefinition;
  getWorkingCopy: (caseInfo: CaseWorkingCopy, id?: string) => CaseItemEntry | undefined;
  updateWorkingCopy: (caseInfo: CaseWorkingCopy, item: CaseItemEntry, id?: string) => CaseWorkingCopy;
};
