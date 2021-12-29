import { FormDefinition, FormItemDefinition } from '../formDefinition';
import { FormItemDefinitionSpecification, FormDefinitionSpecification } from './index';

type ValidationReport = {
  valid: boolean;
  issues: string[]
}

type FormValidationReport = ValidationReport & {
  itemReports: ValidationReport[]
}

function validateItem(form: FormDefinition, actual: FormItemDefinition, specification: FormItemDefinitionSpecification): boolean {
  return (specification.validator ?? (() => true))({form, item: actual});
}

export function validateForm(specification: FormDefinitionSpecification, form: FormDefinition): FormValidationReport {

  const itemReports: ValidationReport[] = Object.entries(specification.items)
    .map(([name, templateItem]) =>{
      let valid = true;
      const issues = [];
      const items = form.filter( i => i.name === name);
      if (items.length > 1) {
        issues.push(`Found ${items.length} items with this name in the form. Names should be unique`);
        valid = false;
      }
      if (templateItem.required && !items.length) {
        issues.push(`Required form item not found`);
        valid = false;
      }
      const invalidItems = items.filter( i => validateItem(form, i, templateItem));
      if (invalidItems.length) {
        issues.push(`${items.length === 1 ? 'Item' : `${invalidItems.length} / ${items.length} items with this name`} failed the validation check specified for the item in the template.`);
      }
      return { valid, issues };
    });
  const formValid = (specification.validator ?? (() => true))(form);

  return {
    issues: formValid ? [] : ["Failed form level validation check"],
    valid: formValid,
    itemReports
  }
}