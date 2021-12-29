import { FormDefinition, FormItemDefinition } from '../formDefinition';

export type DefinitionFileSpecification = {
  definitionFilePath: string,
}

export type DefinitionSpecification<T = any, TValidatorInput = T> = {
  default?: T
  required: boolean
  validator?: (item: TValidatorInput) => boolean
}

export type FormItemDefinitionSpecification = DefinitionSpecification<FormItemDefinition, {form: FormDefinition, item: FormItemDefinition}>

export type FormDefinitionSpecification = {
  items: Record<string, FormItemDefinitionSpecification>
  // If validation for the entire form is required, not tied to individual elements
  validator?: (form: FormDefinition) => boolean
};

export function isDefinitionSpecification(instance: unknown): instance is DefinitionSpecification {
  return (typeof (<DefinitionSpecification>instance).required) === 'boolean';
}

export function isFormDefinitionSpecification(instance: unknown): instance is FormDefinitionSpecification {
  const formDefinitionSpecification = <FormDefinitionSpecification>instance;
  return (typeof formDefinitionSpecification.items) === 'object' &&
    (!formDefinitionSpecification.validator || (typeof formDefinitionSpecification.validator) === 'function');
}

function isDefinitionFileSpecification(instance: unknown): instance is DefinitionFileSpecification {
  return (typeof (<DefinitionFileSpecification>instance).definitionFilePath) === 'string';
}

type FormDefinitionSpecificationNode = {[key: string]: FormDefinitionSpecificationNode} | FormDefinitionSpecification;


function recurseDefinitionFileNode(fileDefinitionStructure: Record<string, unknown>, processor: (specification: DefinitionFileSpecification, path: string[])=>void, currentPath: string[]): void {
  Object.entries(fileDefinitionStructure).forEach(([name, subNode])=>{
    const path = [...currentPath, name];
    if (isDefinitionFileSpecification(subNode)) {
      processor(subNode, path);
    }
    else if (typeof subNode === 'object' && !Array.isArray(subNode) ){
      recurseDefinitionFileNode(<Record<string, unknown>>subNode, processor, path);
    }
  })
}

export function processDefinitionFiles(fileDefinitionStructure: Record<string, unknown>, processor: (specification: DefinitionFileSpecification, path: string[])=>Promise<void>): void {
  recurseDefinitionFileNode(fileDefinitionStructure, processor, [])
}

export * from './generate';