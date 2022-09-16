import { CaseItemEntry } from '../../../types/types';
import { CaseWorkingCopy } from '../reducer';

export const getWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  id?: string,
): CaseItemEntry | undefined =>
  id ? caseWorkingCopy.sections[sectionName]?.existing[id] : caseWorkingCopy.sections[sectionName]?.new;

export const setWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  item: CaseItemEntry,
  id?: string,
): CaseWorkingCopy => {
  if (!caseWorkingCopy.sections[sectionName]) {
    caseWorkingCopy.sections[sectionName] = { existing: {} };
  }
  if (id) {
    caseWorkingCopy.sections[sectionName].existing[id] = item;
  } else {
    caseWorkingCopy.sections[sectionName].new = item;
  }
  return caseWorkingCopy;
};
