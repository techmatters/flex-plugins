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
    .map(([name, itemDefinitionSpecification]) =>
      generateDefaultItem(<DefinitionSpecification>itemDefinitionSpecification, {
        type: 'input',
        name,
        label: name,
      }),
    );
}
