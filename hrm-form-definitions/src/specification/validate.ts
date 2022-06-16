import { CategoriesDefinition, FormDefinition, FormItemDefinition } from '../formDefinition';
import {
  FormItemDefinitionSpecification,
  FormDefinitionSpecification,
  DefinitionSpecification,
} from './index';

type ValidationReport = {
  valid: boolean;
  issues: string[];
};

type FormValidationReport = ValidationReport & {
  itemReports: { [item: string]: ValidationReport };
};

function validateFormItemDefinition(
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
          validateFormItemDefinition(form, item, templateItem);
          return null;
        } catch (error) {
          valid = false;
          return `Item ${item.name} failed validation: ${(<Error>error).message}`;
        }
      })
      .filter((issue) => issue);
    issues.push(...itemValidationIssues);
    return { ...accum, [name]: { valid, issues } };
  }, {});
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
