/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * Linked dropdowns: a chain of fields where each one's answers depend on the answer above,
 * e.g. Province -> Municipality -> District.
 *
 * In the definition files each level is its own field: the first is a 'select', the rest are
 * 'dependent-select' fields whose options are grouped by the *value* of the level above:
 *
 *   { "type": "dependent-select", "dependsOn": "province",
 *     "options": { "Abra": [{ "value": "Bangued", "label": "Bangued" }, ...] } }
 *
 * The editor works on a tree of answers instead, converting to and from that shape.
 * Because lists are keyed by value alone, two answers with the same value at a level that has
 * a level below it would share one list - makeKeyValuesUnique prevents that.
 */
import type {
  DependentOptions,
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from './definitions';
import { getReferenceData, resolveOptions } from './definitions';
import { blankOptionValueFor, isBlankOption, toFieldName, uniqueFieldName, updateField } from './formEditing';

export type AnswerNode = {
  id: string;
  label: string;
  // What's saved on the contact. Kept as-is for answers that already existed.
  value: string;
  existing: boolean;
  children: AnswerNode[];
};

// Lists bigger than this are moved to ReferenceData.json instead of sitting in the form
export const REFERENCE_DATA_THRESHOLD = 200;
const MAX_CHAIN_DEPTH = 10;

let nextAnswerId = 0;
export const newAnswerNode = (
  label: string,
  value: string = label.trim(),
  existing = false,
  children: AnswerNode[] = [],
): AnswerNode => {
  nextAnswerId += 1;
  return { id: `answer-${nextAnswerId}`, label, value, existing, children };
};

/**
 * Finding chains in a form
 */

const dependentsOf = (form: FormItemJsonDefinition[], name: string) =>
  form.filter((item) => item.type === 'dependent-select' && item.dependsOn === name);

/**
 * All chains (as field names, top level first) that go through the given field.
 * A field can be in several chains when two dropdowns depend on the same question.
 */
export const findChainsThroughField = (
  form: FormItemJsonDefinition[],
  fieldName: string,
): string[][] => {
  const byName = new Map(form.map((item) => [item.name, item]));
  if (!byName.has(fieldName)) return [];

  const ancestors: string[] = [fieldName];
  let current = byName.get(fieldName);
  while (
    current?.type === 'dependent-select' &&
    byName.has(current.dependsOn) &&
    !ancestors.includes(current.dependsOn) &&
    ancestors.length < MAX_CHAIN_DEPTH
  ) {
    ancestors.unshift(current.dependsOn);
    current = byName.get(current.dependsOn);
  }

  const downwardChains = (name: string, depth: number): string[][] => {
    const dependents = dependentsOf(form, name);
    if (dependents.length === 0 || depth >= MAX_CHAIN_DEPTH) return [[name]];
    return dependents.flatMap((dependent) =>
      downwardChains(dependent.name, depth + 1).map((chain) => [name, ...chain]),
    );
  };

  return downwardChains(fieldName, ancestors.length)
    .map((down) => [...ancestors.slice(0, -1), ...down])
    .filter((chain) => chain.length >= 2);
};

/**
 * Converting fields <-> answer tree
 */

export type ChainTree = {
  roots: AnswerNode[];
  // The blank "nothing chosen yet" first answer of the top dropdown, kept as it was
  rootBlankOption?: SelectOption;
  // Values used by more than one answer at a level that has a level below (they share a list)
  sharedValues: string[];
  // Lists for a value that isn't an answer of the level above, so they can never show.
  // They're kept as they are on save, unless the user replaces everything with an import.
  unusedLists: UnusedList[];
};

export type UnusedList = { level: number; key: string; options: SelectOption[] };

const toNodes = (
  options: SelectOption[],
  level: number,
  levelOptions: unknown[],
  depth: number,
): AnswerNode[] =>
  options.map((option) => {
    const value = String(option.value);
    const listsBelow = levelOptions[level + 1] as DependentOptions | undefined;
    const children =
      level + 1 < depth ? toNodes(listsBelow?.[value] ?? [], level + 1, levelOptions, depth) : [];
    return newAnswerNode(String(option.label ?? ''), value, true, children);
  });

export const chainToTree = (
  fields: FormItemJsonDefinition[],
  referenceData: Record<string, unknown>,
): ChainTree => {
  const levelOptions = fields.map((field) => resolveOptions<unknown>(field, referenceData));
  let rootOptions = (levelOptions[0] as SelectOption[] | undefined) ?? [];
  const rootBlankOption =
    rootOptions.length > 0 && isBlankOption(rootOptions[0], 0) ? rootOptions[0] : undefined;
  if (rootBlankOption) rootOptions = rootOptions.slice(1);

  const roots = toNodes(rootOptions, 0, levelOptions, fields.length);

  const sharedValues: string[] = [];
  const unusedLists: UnusedList[] = [];
  let levelNodes = roots;
  for (let level = 0; level < fields.length - 1; level += 1) {
    const counts = new Map<string, number>();
    levelNodes.forEach((node) => counts.set(node.value, (counts.get(node.value) ?? 0) + 1));
    const listsBelow = (levelOptions[level + 1] ?? {}) as DependentOptions;
    Object.entries(listsBelow).forEach(([key, options]) => {
      if ((counts.get(key) ?? 0) > 1) sharedValues.push(key);
      if (!counts.has(key)) unusedLists.push({ level: level + 1, key, options });
    });
    levelNodes = levelNodes.flatMap((node) => node.children);
  }

  return { roots, rootBlankOption, sharedValues, unusedLists };
};

const toOption = (node: AnswerNode): SelectOption => ({ value: node.value, label: node.label });

/**
 * Options for each field in the chain: a list for the top field, then lists grouped by the
 * value of the answer above. If two answers share a value (only possible for data that
 * already shared it), their lists are merged, which is how Aselo already shows them.
 */
export const treeToChainOptions = (
  roots: AnswerNode[],
  depth: number,
  rootBlankOption?: SelectOption,
  unusedLists: UnusedList[] = [],
): [SelectOption[], ...DependentOptions[]] => {
  const top = [...(rootBlankOption ? [rootBlankOption] : []), ...roots.map(toOption)];
  const dependentLevels: DependentOptions[] = [];
  let levelNodes = roots;
  for (let level = 1; level < depth; level += 1) {
    const lists: DependentOptions = {};
    levelNodes.forEach((node) => {
      if (node.children.length === 0) return;
      const existing = lists[node.value];
      if (!existing) {
        lists[node.value] = node.children.map(toOption);
        return;
      }
      const seen = new Set(existing.map((option) => String(option.value)));
      node.children.forEach((child) => {
        if (!seen.has(child.value)) existing.push(toOption(child));
      });
    });
    unusedLists
      .filter((unused) => unused.level === level && !(unused.key in lists))
      .forEach((unused) => {
        lists[unused.key] = unused.options;
      });
    dependentLevels.push(lists);
    levelNodes = levelNodes.flatMap((node) => node.children);
  }
  return [top, ...dependentLevels];
};

/**
 * Unique values
 */

type UniqueResult = {
  roots: AnswerNode[];
  renamed: number;
  // Values still shared by more than one answer (existing data that wasn't re-imported)
  stillShared: number;
};

/**
 * Gives answers a unique saved value wherever the same value appears more than once at a
 * level that has a level below, e.g. two "San Jose" municipalities in different provinces
 * become "San Jose (Batangas)" and "San Jose (Cebu)". The label counselors see is unchanged.
 *
 * Answers that already existed keep their value unless fixExisting is set (used after a
 * spreadsheet import, where the user is replacing the whole list).
 */
export const makeKeyValuesUnique = (
  roots: AnswerNode[],
  depth: number,
  { fixExisting }: { fixExisting: boolean },
): UniqueResult => {
  const cloned: AnswerNode[] = structuredClone(roots);
  let renamed = 0;
  let stillShared = 0;

  type Placed = { node: AnswerNode; parent?: AnswerNode; grandparent?: AnswerNode };
  let level: Placed[] = cloned.map((node) => ({ node }));

  for (let levelIndex = 0; levelIndex < depth - 1; levelIndex += 1) {
    const used = new Set(level.map(({ node }) => node.value));
    const groups = new Map<string, Placed[]>();
    level.forEach((placed) => {
      const group = groups.get(placed.node.value) ?? [];
      group.push(placed);
      groups.set(placed.node.value, group);
    });

    groups.forEach((group) => {
      if (group.length < 2 || !group.some(({ node }) => node.children.length > 0)) return;
      const toRename = group.filter(({ node }) => fixExisting || !node.existing);
      toRename.forEach(({ node, parent, grandparent }) => {
        const candidates = [
          parent ? `${node.label} (${parent.label})` : undefined,
          parent && grandparent ? `${node.label} (${parent.label}, ${grandparent.label})` : undefined,
        ].filter((candidate): candidate is string => Boolean(candidate));
        let value = candidates.find((candidate) => !used.has(candidate));
        if (!value) {
          const base = candidates[0] ?? node.label;
          let suffix = 2;
          while (used.has(`${base} ${suffix}`)) suffix += 1;
          value = `${base} ${suffix}`;
        }
        used.add(value);
        node.value = value;
        node.existing = false;
        renamed += 1;
      });
      if (group.length - toRename.length > 1) stillShared += 1;
    });

    level = level.flatMap(({ node, parent }) =>
      node.children.map((child) => ({ node: child, parent: node, grandparent: parent })),
    );
  }

  return { roots: cloned, renamed, stillShared };
};

/**
 * Spreadsheet rows <-> tree
 */

export type ImportStats = {
  rowsRead: number;
  emptyRows: number;
  // Rows like "Abra, , Agtangao" where a level in the middle is missing
  rowsWithGaps: number;
  duplicateRows: number;
  extraColumns: boolean;
};

const pathKey = (labels: string[]) => labels.join('\u0000');

/**
 * Builds a tree from rows of labels, one column per level. Answers that match an existing
 * path (same labels) keep their saved value; new ones are saved as their label.
 */
export const rowsToTree = (
  rows: string[][],
  depth: number,
  previous: AnswerNode[] = [],
): { roots: AnswerNode[]; stats: ImportStats } => {
  const previousByPath = new Map<string, AnswerNode>();
  const indexPrevious = (nodes: AnswerNode[], labels: string[]) =>
    nodes.forEach((node) => {
      const path = [...labels, node.label.trim()];
      previousByPath.set(pathKey(path), node);
      indexPrevious(node.children, path);
    });
  indexPrevious(previous, []);

  const roots: AnswerNode[] = [];
  const created = new Map<string, AnswerNode>();
  const stats: ImportStats = {
    rowsRead: rows.length,
    emptyRows: 0,
    rowsWithGaps: 0,
    duplicateRows: 0,
    extraColumns: false,
  };

  rows.forEach((row) => {
    if (row.slice(depth).some((cell) => String(cell ?? '').trim())) stats.extraColumns = true;
    const cells = row.slice(0, depth).map((cell) => String(cell ?? '').trim());
    let last = cells.length - 1;
    while (last >= 0 && !cells[last]) last -= 1;
    if (last < 0) {
      stats.emptyRows += 1;
      return;
    }
    const labels = cells.slice(0, last + 1);
    if (labels.some((label) => !label)) {
      stats.rowsWithGaps += 1;
      return;
    }
    if (created.has(pathKey(labels))) {
      stats.duplicateRows += 1;
      return;
    }

    let siblings = roots;
    labels.forEach((label, index) => {
      const key = pathKey(labels.slice(0, index + 1));
      let node = created.get(key);
      if (!node) {
        const before = previousByPath.get(key);
        node = before
          ? newAnswerNode(label, before.value, before.existing)
          : newAnswerNode(label);
        created.set(key, node);
        siblings.push(node);
      }
      siblings = node.children;
    });
  });

  return { roots, stats };
};

// One row per complete path, for downloading as a spreadsheet
export const treeToRows = (roots: AnswerNode[]): string[][] => {
  const rows: string[][] = [];
  const walk = (nodes: AnswerNode[], labels: string[]) =>
    nodes.forEach((node) => {
      const path = [...labels, node.label];
      if (node.children.length === 0) rows.push(path);
      else walk(node.children, path);
    });
  walk(roots, []);
  return rows;
};

export const countByLevel = (roots: AnswerNode[], depth: number): number[] => {
  const counts: number[] = [];
  let level = roots;
  for (let index = 0; index < depth; index += 1) {
    counts.push(level.length);
    level = level.flatMap((node) => node.children);
  }
  return counts;
};

/**
 * Editing the tree. Answers are addressed by the ids of the answers above them
 * (an empty path means the top level).
 */

export const getChildrenAtPath = (
  roots: AnswerNode[],
  path: string[],
): AnswerNode[] | undefined => {
  let nodes: AnswerNode[] | undefined = roots;
  for (const id of path) {
    nodes = nodes?.find((node) => node.id === id)?.children;
    if (!nodes) return undefined;
  }
  return nodes;
};

export const updateChildrenAtPath = (
  roots: AnswerNode[],
  path: string[],
  update: (children: AnswerNode[]) => AnswerNode[],
): AnswerNode[] => {
  if (path.length === 0) return update(roots);
  const [id, ...rest] = path;
  return roots.map((node) =>
    node.id === id ? { ...node, children: updateChildrenAtPath(node.children, rest, update) } : node,
  );
};

export const countDescendants = (node: AnswerNode): number =>
  node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);

/**
 * Writing back to the fields
 */

const countOptions = (options: unknown) =>
  Array.isArray(options)
    ? options.length
    : Object.values((options ?? {}) as DependentOptions).reduce(
        (total, list) => total + list.length,
        0,
      );

// Lists keep the order they had in the file, so saving doesn't reshuffle the JSON for review
const keepKeyOrder = <T>(options: T, previous: unknown): T => {
  if (Array.isArray(options) || !previous || Array.isArray(previous)) return options;
  const lists = options as DependentOptions;
  const ordered: DependentOptions = {};
  Object.keys(previous as DependentOptions).forEach((key) => {
    if (key in lists) ordered[key] = lists[key];
  });
  Object.keys(lists).forEach((key) => {
    if (!(key in ordered)) ordered[key] = lists[key];
  });
  return ordered as T;
};

/**
 * Puts the chain's answers into its fields. Lists that already live in ReferenceData.json
 * stay there (so other forms sharing them get the update). An inline list moves there when
 * it grows past the threshold; lists that were already big inline are left as they are, so
 * a small edit doesn't restructure the files.
 */
export const applyChainOptions = (
  fields: FormItemJsonDefinition[],
  levelOptions: [SelectOption[], ...DependentOptions[]],
  files: DefinitionFileMap,
  threshold = REFERENCE_DATA_THRESHOLD,
): { fields: FormItemJsonDefinition[]; referenceData?: Record<string, unknown> } => {
  const referenceData = { ...getReferenceData(files) };
  const usedKeys = new Set(Object.keys(referenceData));
  let referenceDataChanged = false;

  const updatedFields = fields.map((field, level) => {
    const options = keepKeyOrder(levelOptions[level], resolveOptions<unknown>(field, referenceData));

    if ('optionsReferenceKey' in field && typeof field.optionsReferenceKey === 'string') {
      referenceData[field.optionsReferenceKey] = options;
      referenceDataChanged = true;
      return field;
    }
    const countBefore = countOptions('options' in field ? field.options : undefined);
    if (countOptions(options) > threshold && countBefore <= threshold) {
      const key = uniqueFieldName(`${field.name}Options`, usedKeys);
      usedKeys.add(key);
      referenceData[key] = options;
      referenceDataChanged = true;
      return updateField(field, { options: undefined, optionsReferenceKey: key });
    }
    return updateField(field, { options });
  });

  return {
    fields: updatedFields,
    referenceData: referenceDataChanged ? referenceData : undefined,
  };
};

/**
 * New fields for a chain. The first level is either a new dropdown or an existing field
 * (for follow-up questions, e.g. "Experiencing abuse?" -> "Risk assessment").
 */
export const createChainFields = (
  levelLabels: string[],
  existingNames: Iterable<string>,
  existingRoot?: FormItemJsonDefinition,
  // Contact forms: Aselo's convention for a field that isn't required. The webchat passes its own.
  blankOptionValue = blankOptionValueFor(false),
): FormItemJsonDefinition[] => {
  const names = [...existingNames];
  const fields: FormItemJsonDefinition[] = [];
  levelLabels.forEach((label, index) => {
    if (index === 0 && existingRoot) {
      fields.push(existingRoot);
      return;
    }
    const name = uniqueFieldName(toFieldName(label), names);
    names.push(name);
    const base = { name, label, isPII: false };
    const field =
      index === 0
        ? { ...base, type: 'select', options: [] }
        : {
            ...base,
            type: 'dependent-select',
            dependsOn: fields[index - 1].name,
            defaultOption: { value: blankOptionValue, label: '' },
            options: {},
          };
    fields.push(field as unknown as FormItemJsonDefinition);
  });
  return fields;
};

/**
 * Other fields, in any form, that use the same shared list in ReferenceData.json
 */
export const findReferenceKeyUsers = (
  files: DefinitionFileMap,
  key: string,
  describeFile: (filePath: string) => string,
): { filePath: string; fieldName: string; description: string }[] =>
  Object.entries(files).flatMap(([filePath, content]) =>
    Array.isArray(content)
      ? (content as FormItemJsonDefinition[])
          .filter((item) => (item as { optionsReferenceKey?: string }).optionsReferenceKey === key)
          .map((item) => ({
            filePath,
            fieldName: item.name,
            description: `${describeFile(filePath)}: ${item.label || item.name}`,
          }))
      : [],
  );
