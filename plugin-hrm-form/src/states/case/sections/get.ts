import { parseISO } from 'date-fns';

import { CaseInfo } from '../../../types/types';

export const getSectionItemById = (propertyName: string) => (caseInfo: CaseInfo, id: string) => {
  const sectionList = caseInfo[propertyName];
  if (Array.isArray(sectionList)) {
    return sectionList.find(s => s.id === id);
  }
  return undefined;
};
export const getMostRecentSectionItem = (propertyName: string) => (caseInfo: CaseInfo) => {
  const sectionList = caseInfo[propertyName];
  if (Array.isArray(sectionList)) {
    const sorted = [...sectionList].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
    return sorted[0];
  }
  return undefined;
};
