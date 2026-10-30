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
 * The Aselo form specification (which fields every helpline must have, etc.), taken from
 * the hrm-form-definitions package so it can't drift from what the plugin expects.
 */
import { aseloFormTemplates } from '@hrm-form-definitions/aseloForms';
import { validateFormDefinition } from '@hrm-form-definitions/specification/validate';
import type { FormTarget } from './definitions';
import { isContactTab } from './definitions';

export { validateFormDefinition };

/**
 * The specification for a form: its contact tab, or for a case section the standard case
 * form with the same file name (e.g. caseForms/HouseholdForm.json). Sections a helpline added
 * itself have none.
 */
export const getFormSpecification = (target: FormTarget) => {
  if (isContactTab(target)) return aseloFormTemplates.tabbedForms[target.key];
  const formName = target.filePath.split('/').pop()!.replace(/\.json$/, '');
  return (aseloFormTemplates.caseForms as Record<string, (typeof aseloFormTemplates.caseForms)[keyof typeof aseloFormTemplates.caseForms]>)[formName];
};

// Fields the specification requires - the plugin relies on them, so they can't be removed
export const isProtectedField = (target: FormTarget, fieldName: string) =>
  Boolean(getFormSpecification(target)?.items[fieldName]?.required);
