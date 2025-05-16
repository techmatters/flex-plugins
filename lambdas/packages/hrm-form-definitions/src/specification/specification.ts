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

import { FormDefinition, FormItemDefinition } from '../formDefinition';

/**
 * Type describing a specification for any part of a definition backed by a file (e.g. form definitions, generic json, single form items)
 */
export type DefinitionFileSpecification = {
  definitionFilePath: string;
};

/**
 * Generic type describing a specification for something in a definition - the 'something' could be an individual form item or a whole JSON file or whatever
 * @param T:                     The type of data being specified
 * @param TValidatorInput:       The input parameter to provide a validator function. By default this is T, i.e. the definition data itself, but it can be changed if more context is required
 * @property default T:          An instance of the data being specified that will be used as the default value when generating a set of forms via a script.
 *                               Should be set if 'required' = true, a boilerplate default will be used in the script if not.
 * @property required boolean:   If a form item with this name must be present in definitions of this form, set this to true
 * @property validator function: (Currently unused) A function which can be implemented to validate the correctness of the definition.
 *                               The return type is 'void' rather than bool, implementers should run assertions rather than returning a valid flag.
 *                               This allows implementers to throw descriptive errors (rather than just 'invalid') and leverage third party assertion libraries like chai.
 *                               If this is specified but 'required' is false, it will only run the validation when an element with this name is present.
 */
export type DefinitionSpecification<T = any, TValidatorInput = T> = {
  default?: T;
  required: boolean;
  validator?: (item: TValidatorInput) => void; // Failed validation should throw assertions
};

/**
 * Alias for a composite of an item and it's parent form in one object. Used as a validator input of form items.
 */
type FormAndItemDefinition = { form: FormDefinition; item: FormItemDefinition };

/**
 * The specification for definitions of individual form items
 * The TValidatorInput parameter is an object that includes the item and the entire wider form, in case that is required context for validation logic
 * The additional 'order' property is provided if explicit ordering needs to be specified, but declaration order is used otherwise
 */
export type FormItemDefinitionSpecification = DefinitionSpecification<
  FormItemDefinition,
  FormAndItemDefinition
> & { order?: number };

/**
 * Defines a specification for a JSON form definition
 * @property items Record:       A map of form items keyed by their name. It is used to specify items on the form that are required, have validation rules (i.e. they must be of a given type), or have default definitions (used by the generation script).
 * @property validator function: An optional top level validator to enforce any rules that don't fit well into single items (i.e. one or other of 2 form elements must be present, but not both)
 */
export type FormDefinitionSpecification = {
  items: Record<string, FormItemDefinitionSpecification>;
  // If validation for the entire form is required, not tied to individual elements
  validator?: (form: FormDefinition) => void;
};

export function isDefinitionSpecification(instance: unknown): instance is DefinitionSpecification {
  return typeof (<DefinitionSpecification>instance).required === 'boolean';
}

export function isFormDefinitionSpecification(
  instance: unknown,
): instance is FormDefinitionSpecification {
  const formDefinitionSpecification = <FormDefinitionSpecification>instance;
  return (
    typeof formDefinitionSpecification.items === 'object' &&
    (!formDefinitionSpecification.validator ||
      typeof formDefinitionSpecification.validator === 'function')
  );
}

function isDefinitionFileSpecification(instance: unknown): instance is DefinitionFileSpecification {
  return typeof (<DefinitionFileSpecification>instance).definitionFilePath === 'string';
}

function recurseDefinitionFileNode(
  fileDefinitionStructure: Record<string, unknown>,
  processor: (specification: DefinitionFileSpecification, path: string[]) => void,
  currentPath: string[],
): void {
  if (isDefinitionFileSpecification(fileDefinitionStructure)) {
    processor(fileDefinitionStructure, currentPath);
  } else {
    Object.entries(fileDefinitionStructure)
      .filter(([, subNode]) => typeof subNode === 'object')
      .forEach(([name, subNode]) => {
        const path = [...currentPath, name];
        if (path.length > 100) {
          throw new Error(
            'Recursion depth just hit 100, this means there is almost certainly a circular reference in the provided data structure.',
          );
        }
        recurseDefinitionFileNode(<Record<string, unknown>>subNode, processor, path);
      });
  }
}

export function processDefinitionFiles(
  fileDefinitionStructure: Record<string, unknown>,
  processor: (specification: DefinitionFileSpecification, path: string[]) => Promise<void>,
): void {
  recurseDefinitionFileNode(fileDefinitionStructure, processor, []);
}
