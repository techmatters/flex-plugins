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
import type { ContactTab } from './definitions';

export { validateFormDefinition };

export const getContactTabSpecification = (tabKey: ContactTab['key']) =>
  aseloFormTemplates.tabbedForms[tabKey];

// Fields the specification requires - the plugin relies on them, so they can't be removed
export const isProtectedField = (tabKey: ContactTab['key'], fieldName: string) =>
  Boolean(getContactTabSpecification(tabKey).items[fieldName]?.required);
