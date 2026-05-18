/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { FormDefinition } from '../formDefinition';
import {
  DefinitionSpecification,
  FormDefinitionSpecification,
  isDefinitionSpecification,
} from './specification';

export function generateDefaultItem<T>(
  specification: DefinitionSpecification<T, unknown>,
  fallback: T,
): T {
  if (specification.default) {
    return specification.default;
  }
  // eslint-disable-next-line no-console
  console.warn('No default was specified, using fallback');
  return fallback;
}

export function generateDefaultForm(specification: FormDefinitionSpecification): FormDefinition {
  return Object.entries(specification.items)
    .filter(
      ([, itemDefinitionSpecification]) =>
        isDefinitionSpecification(itemDefinitionSpecification) &&
        (itemDefinitionSpecification.required || itemDefinitionSpecification.default),
    )
    .sort(
      ([, spec1], [, spec2]) =>
        (spec1.order ?? Number.MAX_VALUE) - (spec2.order ?? Number.MAX_VALUE),
    )
    .map(([name, itemDefinitionSpecification]) =>
      generateDefaultItem(<DefinitionSpecification>itemDefinitionSpecification, {
        type: 'input',
        name,
        label: name,
      }),
    );
}
