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
 * Case statuses (CaseStatus.json): { <key>: { value, label, color, transitions } }.
 *
 * Cases save the status `value`, and `transitions` list the values a case can move to
 * (plugin-hrm-form/src/states/case/caseStatus.ts). "open" (new cases) and "closed" (closing
 * and reopening permissions) mean something to Aselo, so they always exist. Labels, colours,
 * order and transitions are free to change.
 */
import type { StatusInfo } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from './definitions';
import { isSameJson } from './changes';
import { toFieldName } from './formEditing';
import type { ValidationIssue } from './validation';

export const CASE_STATUS_FILE = 'CaseStatus.json';

// The colours the plugin's status pills use
export const STATUS_COLORS = ['green', 'blue', 'yellow', 'orange', 'red', 'grey'];

export const REQUIRED_STATUSES = ['open', 'closed'];

export type CaseStatuses = Record<string, StatusInfo>;

export const getCaseStatusMap = (files: DefinitionFileMap): CaseStatuses =>
  (files[CASE_STATUS_FILE] ?? {}) as CaseStatuses;

export const newStatusValue = (label: string, taken: string[]) => {
  const base = toFieldName(label) || 'status';
  let value = base;
  for (let n = 2; taken.includes(value); n += 1) value = `${base}${n}`;
  return value;
};

// What the plugin offers in the status dropdown for a case with this status
export const availableTransitions = (statuses: StatusInfo[], current: string): StatusInfo[] => {
  const currentStatus = statuses.find((status) => status.value === current);
  if (!currentStatus) return [];
  const allowed = [...(currentStatus.transitions ?? []), currentStatus.value];
  return statuses.filter((status) => allowed.includes(status.value));
};

const checkStatuses = (files: DefinitionFileMap): ValidationIssue[] => {
  if (!(CASE_STATUS_FILE in files)) return [];
  const statuses = Object.values(getCaseStatusMap(files));
  const values = statuses.map((status) => status.value);
  const issues: ValidationIssue[] = [];
  const add = (message: string, severity: ValidationIssue['severity'] = 'error') =>
    issues.push({ severity, message: `Case statuses: ${message}` });
  REQUIRED_STATUSES.filter((value) => !values.includes(value)).forEach((value) =>
    add(`Aselo needs a status saved as “${value}”.`),
  );
  statuses.forEach((status) => {
    if (!String(status.label ?? '').trim()) add(`the status saved as “${status.value}” has no name.`);
    (status.transitions ?? [])
      .filter((target) => !values.includes(target))
      .forEach((target) =>
        add(
          `“${status.label}” can move to “${target}”, which isn’t a status, so that option never shows.`,
          'warning',
        ),
      );
  });
  return issues;
};

// Problems that were already there before the user's changes are only warnings
export const validateCaseStatuses = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkStatuses(originalFiles).map((found) => found.message));
  return checkStatuses(draftFiles).map((found) =>
    found.severity === 'error' && before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
};

export const summarizeCaseStatusChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = Object.values(getCaseStatusMap(originalFiles));
  const after = Object.values(getCaseStatusMap(draftFiles));
  if (isSameJson(before, after)) return [];
  const labelOf = (value: string) =>
    after.find((status) => status.value === value)?.label ??
    before.find((status) => status.value === value)?.label ??
    value;
  const lines: string[] = [];
  after.forEach((status) => {
    const previous = before.find((old) => old.value === status.value);
    if (!previous) {
      lines.push(`Added “${status.label}”`);
      return;
    }
    if (previous.label !== status.label) lines.push(`Renamed “${previous.label}” to “${status.label}”`);
    if (previous.color !== status.color) lines.push(`New colour for “${status.label}”`);
    if (!isSameJson([...previous.transitions].sort(), [...status.transitions].sort())) {
      lines.push(
        `“${status.label}” can now move to: ${status.transitions.map(labelOf).join(', ') || 'nothing (final status)'}`,
      );
    }
  });
  before
    .filter((status) => !after.some((other) => other.value === status.value))
    .forEach((status) => lines.push(`Removed “${status.label}”`));
  const kept = (list: StatusInfo[], others: StatusInfo[]) =>
    list.map((status) => status.value).filter((value) => others.some((other) => other.value === value));
  if (!isSameJson(kept(before, after), kept(after, before))) lines.push('Reordered');
  return [{ title: 'Case statuses', lines }];
};
