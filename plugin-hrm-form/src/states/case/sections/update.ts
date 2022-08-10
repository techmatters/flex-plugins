import { CaseInfo, CaseItemEntry, EntryInfo } from '../../../types/types';
import { DefinitionVersion, FormDefinition } from 'hrm-form-definitions';
import { CaseSectionApi, CaseUpdater } from './api';

export const upsertCaseSectionList = (listProperty: string, entryProperty: string = listProperty) => (
  original: CaseInfo,
  temporaryInfo: CaseItemEntry,
) => {
  const sectionList = [...((original ?? {})[listProperty] ?? [])];
  const { ...entry } = { ...temporaryInfo, [entryProperty]: temporaryInfo.form };
  if (entryProperty !== 'form') {
    delete entry.form;
  }
  const indexToUpdate = sectionList.findIndex(s => s.id === temporaryInfo.id);
  if (indexToUpdate > -1) {
    sectionList[indexToUpdate] = entry;
  } else {
    sectionList.push(entry);
  }

  return original ? { ...original, [listProperty]: sectionList } : { [listProperty]: sectionList };
};

export const upsertCaseList = <T extends EntryInfo>(
  listGetter: (ci: CaseInfo) => T[] | undefined,
  caseItemToListItem: (caseItemEntry: CaseItemEntry) => T,
): CaseUpdater => (original: CaseInfo, temporaryInfo: CaseItemEntry, id?: string) => {
  const copy = { ...original };
  const sectionList = listGetter(copy);
  const entry: T = caseItemToListItem(temporaryInfo);
  const indexToUpdate = sectionList.findIndex(s => s.id === temporaryInfo.id);
  if (indexToUpdate > -1) {
    sectionList[indexToUpdate] = entry;
  } else {
    sectionList.push(entry);
  }
  return copy;
};

const createCopyForDifferentSection = (
  sourceItem: CaseItemEntry,
  sourceDefinition: FormDefinition,
  targetDefinition: FormDefinition,
): CaseItemEntry => {
  const commonFormElements: FormDefinition = sourceDefinition.filter(sfi =>
    targetDefinition.find(tfi => sfi.name === tfi.name && sfi.type === tfi.type),
  );
  const commonFormElementSet = new Set(commonFormElements.map(fe => fe.name));
  const targetItemEntries = Object.entries(sourceItem.form).filter(([k]) => commonFormElementSet.has(k));
  return { ...sourceItem, form: Object.fromEntries(targetItemEntries) };
};

type CopyCaseSectionParams = {
  definition: DefinitionVersion;
  original: CaseInfo;
  fromApi: CaseSectionApi<unknown>;
  fromId?: string;
  toApi: CaseSectionApi<unknown>;
};

export const copyCaseSection = ({
                                  definition,
                                  original,
                                  fromApi,
                                  fromId = undefined, // Last item in the list if not specified
                                  toApi,
                                }: CopyCaseSectionParams) => {
  const fromItem = fromId ? fromApi.getSectionItemById(original, fromId) : fromApi.getMostRecentSectionItem(original);
  if (!fromItem) {
    console.warn(
      `Attempted to copy from '${fromApi.label}' [id: ${fromId ?? '<most recent>'}] to '${
        toApi.label
      }' but the specified source item was not found.`,
    );
    return original;
  }
  const copy = createCopyForDifferentSection(
    fromApi.toForm(fromItem),
    fromApi.getSectionFormDefinition(definition),
    toApi.getSectionFormDefinition(definition),
  );
  return toApi.upsertCaseSectionItemFromForm(original, copy);
};