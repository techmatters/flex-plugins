import * as fs from 'fs';
import path from 'path';
import {
  generateDefaultForm,
  generateDefaultItem,
  isDefinitionSpecification,
  isFormDefinitionSpecification,
  processDefinitionFiles,
  aseloFormTemplates,
} from 'hrm-form-definitions';

function main() {
  const rootFolder = process.argv[2];
  processDefinitionFiles(aseloFormTemplates, async (definitionSpecification) => {
    console.log(`Generating ${definitionSpecification.definitionFilePath}`);
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
