import { DefinitionVersion, FormDefinition, FormItemDefinition } from 'hrm-form-definitions';

import { CaseInfo, CaseItemEntry, EntryInfo } from '../../../types/types';
import { CaseSectionApi, CaseUpdater } from './api';

export const upsertCaseSectionItemUsingSectionName = (listProperty: string, entryProperty: string = listProperty) => (
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

export const upsertCaseSectionItem = <T extends EntryInfo>(
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

type FormValue = string | boolean | number | string[];

/**
 * This will filter out invalid selections from form items that involve selecting from a predefined list
 * This is specifically to cater for the case where both of the form items are of the same type but have different sets of options defined
 * Scenarios where form items have the same name but different types (so free text tries to be set for a checkbox field, for example) should not occur
 * This is because items with matched names but mismatched types are not considered valid for copying in the first place.
 * @param item
 * @param value
 * @param form - the entire set of form values - dependent selects need this context
 */
const removeInvalidFormSelections = (
  item: FormItemDefinition,
  value: FormValue,
  form: Record<string, FormValue>,
): FormValue | undefined => {
  switch (item.type) {
    case 'select':
      return item.options.find(opt => opt.value === value) ? value : undefined;
    case 'listbox-multiselect': {
      const validValues = item.options.map(opt => opt.value);
      return Array.isArray(value) ? value.filter(selectedOption => validValues.includes(selectedOption)) : [];
    }
    case 'dependent-select': {
      const dependentValue = form[item.dependsOn];
      if (typeof dependentValue !== 'string') return undefined;
      const valueSet = item.options[dependentValue];
      if (!Array.isArray(valueSet)) return undefined;
      return valueSet.find(opt => opt.value === value) ? value : undefined;
    }
    default:
      return value;
  }
};

const createCopyForDifferentSection = (
  sourceItem: CaseItemEntry,
  sourceDefinition: FormDefinition,
  targetDefinition: FormDefinition,
): CaseItemEntry => {
  const validTargetFormElements: FormDefinition = targetDefinition.filter(sfi =>
    sourceDefinition.find(tfi => sfi.name === tfi.name && sfi.type === tfi.type),
  );
  const validTargetFormElementMap = Object.fromEntries(validTargetFormElements.map(fe => [fe.name, fe]));
  const targetFormEntries = Object.entries(sourceItem.form).filter(([k]) => validTargetFormElementMap[k]);
  const targetForm = Object.fromEntries(targetFormEntries);
  // Have to do this ugly second pass because dependent selects need the value of the item depended to have been written prior to validating it's own value
  const sanitisedTargetFormEntries = targetFormEntries
    .map(([name, value]) => [name, removeInvalidFormSelections(validTargetFormElementMap[name], value, targetForm)])
    .filter(([, val]) => val !== undefined);
  return { ...sourceItem, form: Object.fromEntries(sanitisedTargetFormEntries) };
};

export const copyCaseSectionItem = ({
  definition,
  original,
  fromApi,
  fromId = undefined, // Last item in the list if not specified
  toApi,
}: {
  definition: DefinitionVersion;
  original: CaseInfo;
  fromApi: CaseSectionApi<unknown>;
  fromId?: string;
  toApi: CaseSectionApi<unknown>;
}) => {
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
