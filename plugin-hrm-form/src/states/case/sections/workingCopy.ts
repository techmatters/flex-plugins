import { CaseItemEntry } from '../../../types/types';
import { CaseWorkingCopy } from '../types';

export const getWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  id?: string,
): CaseItemEntry | undefined =>
  id ? caseWorkingCopy.sections[sectionName]?.existing[id] : caseWorkingCopy.sections[sectionName]?.new;

export const setWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  item?: CaseItemEntry,
  id?: string,
): CaseWorkingCopy => {
  if (!caseWorkingCopy.sections[sectionName]) {
    caseWorkingCopy.sections[sectionName] = { existing: {} };
  }
  if (id) {
    // Id specified so we are updating an existing section's working copy
    if (item) {
      // Overwriting
      caseWorkingCopy.sections[sectionName].existing[id] = item;
    } else {
      // Removing
      delete caseWorkingCopy.sections[sectionName].existing[id];
    }
  }
  // Id not specified so we are updating a 'new', as yet unsaved section's working copy
  else if (item) {
    // Overwriting
    caseWorkingCopy.sections[sectionName].new = item;
  } else {
    // Removing
    delete caseWorkingCopy.sections[sectionName].new;
  }
  return caseWorkingCopy;
};
