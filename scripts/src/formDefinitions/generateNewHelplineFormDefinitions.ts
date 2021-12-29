import * as fs from 'fs';
import path from 'path';
import {
  generateDefaultForm,
  generateDefaultItem,
  isDefinitionSpecification,
  isFormDefinitionSpecification,
  processDefinitionFiles,
} from 'hrm-form-definitions';
import { aseloFormTemplates } from 'hrm-form-definitions/aseloForms';

function main() {
  const rootFolder = process.argv[2];
  console.log('cwd', process.cwd());
  processDefinitionFiles(aseloFormTemplates, async (definitionSpecification) => {
    let jsonToWrite: string | undefined;
    if (isFormDefinitionSpecification(definitionSpecification)) {
      const defaultForm = generateDefaultForm(definitionSpecification);
      jsonToWrite = JSON.stringify(defaultForm);
    } else if (isDefinitionSpecification(definitionSpecification)) {
      const defaultItem = generateDefaultItem(definitionSpecification, {});
      if (defaultItem) {
        jsonToWrite = JSON.stringify(defaultItem);
      }
    }
    if (jsonToWrite) {
      const resolved = path.resolve(
        process.cwd(),
        rootFolder,
        definitionSpecification.definitionFilePath,
      );
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, jsonToWrite);
    }
  });
}

main();
