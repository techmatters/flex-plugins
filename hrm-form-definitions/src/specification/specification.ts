import { FormDefinition, FormItemDefinition } from '../formDefinition';

export type DefinitionFileSpecification = {
  definitionFilePath: string;
};

export type DefinitionSpecification<T = any, TValidatorInput = T> = {
  default?: T;
  required: boolean;
  validator?: (item: TValidatorInput) => void; // Failed validation should throw assertions
};

type FormAndItemDefinition = { form: FormDefinition; item: FormItemDefinition };

export type FormItemDefinitionSpecification = DefinitionSpecification<
  FormItemDefinition,
  FormAndItemDefinition
>;

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
