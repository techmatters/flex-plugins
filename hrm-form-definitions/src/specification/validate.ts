import {
  CategoriesDefinition,
  FormDefinition,
  FormItemDefinition,
  SelectOption,
} from '../formDefinition';
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

function validateFormItemDefinition(
  form: FormDefinition,
  actual: FormItemDefinition,
  specification: FormItemDefinitionSpecification,
): void {
  // Run some basic validations on the JSON structure
  switch (actual.type) {
    case 'dependent-select':
      Object.values(actual.options).forEach(validateSelectOptions);
      return;
    case 'select':
    case 'listbox-multiselect':
      validateSelectOptions(actual.options);
      break;
    default:
  }
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
