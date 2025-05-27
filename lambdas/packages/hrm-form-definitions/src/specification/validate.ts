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

import {
  CategoriesDefinition,
  FormDefinition,
  FormInputType,
  FormItemDefinition,
  SelectOption,
} from '../formDefinition';
import {
  DefinitionSpecification,
  FormDefinitionSpecification,
  FormItemDefinitionSpecification,
} from './index';

type ValidationReport = {
  valid: boolean;
  issues: string[];
};

type FormValidationReport = ValidationReport & {
  itemReports: { [item: string]: ValidationReport };
};

const validateSelectOptions = (options: SelectOption[]): void => {
  if (options.length < 1) {
    throw new Error(
      `Options sets for form items should always be an array with at least 1 item, got ${JSON.stringify(
        options,
      )}`,
    );
  }
  options.forEach((option) => {
    if (option.value === undefined || typeof option.label !== 'string') {
      throw new Error(
        `Option malformed, expected a value property and a string label property, got ${JSON.stringify(
          option,
        )}`,
      );
    }
  });
};

function validateFormItemDefinition(form: FormDefinition, actual: FormItemDefinition): void {
  // Check the type exists
  const formInputTypes = Object.values(FormInputType);
  if (!formInputTypes.includes(actual.type)) {
    throw new Error(
      `Unsupported input type: ${actual.type}, currently supported types: ${formInputTypes}`,
    );
  }
  // Run some basic validations on the JSON structure
  switch (actual.type) {
    case FormInputType.DependentSelect:
      Object.values(actual.options).forEach(validateSelectOptions);
      return;
    case FormInputType.Select:
    case FormInputType.ListboxMultiselect:
      validateSelectOptions(actual.options);
      break;
    default:
  }
}

function validateFormItemDefinitionAgainstSpecification(
  form: FormDefinition,
  actual: FormItemDefinition,
  specification: FormItemDefinitionSpecification,
): void {
  (specification.validator ?? (() => {}))({ form, item: actual });
}

export function validateFormDefinition(
  specification: FormDefinitionSpecification,
  form: FormDefinition,
): FormValidationReport {
  const basicItemValidationReportList = form.map((item) => {
    try {
      validateFormItemDefinition(form, item);
      return [item.name, { valid: true, issues: [] }];
    } catch (error) {
      return [
        item.name,
        {
          valid: false,
          issues: [`Item ${item.name} failed validation: ${(<Error>error).message}`],
        },
      ];
    }
  });

  const basicItemValidationReports: { [item: string]: ValidationReport } = Object.fromEntries(
    basicItemValidationReportList,
  );

  const itemReports: { [item: string]: ValidationReport } = Object.entries(
    specification.items,
  ).reduce((accum, [name, templateItem]) => {
    let valid = true;
    const issues = [];
    const items = form.filter((i) => i.name === name);
    if (items.length > 1) {
      issues.push(`Found ${items.length} items with this name in the form. Names should be unique`);
      valid = false;
    }
    if (templateItem.required && !items.length) {
      issues.push('Required form item not found');
      valid = false;
    }

    const itemValidationIssues: string[] = <string[]>items
      .map((item) => {
        try {
          validateFormItemDefinitionAgainstSpecification(form, item, templateItem);
          return null;
        } catch (error) {
          valid = false;
          return `Item ${item.name} failed validation: ${(<Error>error).message}`;
        }
      })
      .filter((issue) => issue);
    issues.push(...itemValidationIssues);
    // Merge into the basic validation report
    const existing = accum[name] ?? { valid: true, issues: [] };
    return {
      ...accum,
      [name]: { valid: existing.valid && valid, issues: [...existing.issues, ...issues] },
    };
  }, basicItemValidationReports);
  let formValidationError: Error | null = null;

  try {
    (specification.validator ?? (() => {}))(form);
  } catch (e) {
    formValidationError = <Error>e;
  }

  // Return valid only if there's no error at top level form or in any item
  const formIsValid =
    !formValidationError &&
    Object.values(itemReports).every((r) => r.valid && r.issues.length === 0);

  return {
    issues: formValidationError ? [formValidationError.message] : [],
    valid: formIsValid,
    itemReports,
  };
}

export function validateCategoriesDefinition(
  specification: DefinitionSpecification,
  definition: CategoriesDefinition,
): ValidationReport {
  const issues = [];

  const categoriesList = Object.entries(definition);

  if (specification.required && !categoriesList.length) {
    issues.push('Definition must contain at least one category.');
  }

  try {
    (specification.validator ?? (() => {}))(definition);
  } catch (e) {
    const issue = e instanceof Error ? e.message : (e as any);
    issues.push(issue);
  }

  const subcategoriesIssues = categoriesList
    .map(([category, entry]) =>
      !Array.isArray(entry.subcategories) || entry.subcategories.length === 0
        ? `Subcategories array missing for category ${category}.`
        : null,
    )
    .filter((issue) => issue);

  subcategoriesIssues.forEach((issue) => issues.push(issue));

  const valid = issues.length === 0;

  return { valid, issues };
}
