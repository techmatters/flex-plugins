/* eslint-disable no-console */
import * as fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import {
  generateDefaultForm,
  generateDefaultItem,
  isDefinitionSpecification,
  isFormDefinitionSpecification,
  processDefinitionFiles,
  aseloFormTemplates,
} from '@tech-matters/hrm-form-definitions';
import prompt from 'prompt';

async function main() {
  const args = yargs(process.argv.slice(2))
    .command(
      '$0 <definitionVersion>',
      'Generate a default set of json form definitions for an Aselo helpline.',
      (argv) => {
        argv.positional('definitionVersion', {
          describe:
            "The definition code for this set of forms (e.g. 'v1', 'br-v1'). The json definitions will be generated under a directory with this as it's name",
          type: 'string',
        });
      },
    )
    .option('r', {
      alias: 'root',
      describe:
        "Root folder to place the definitions in. Will default to '../hrm-form-definitions/form-definitions', ready for use in the app if run using the npm script",
    })
    .option('f', {
      alias: 'force',
      describe:
        'Auto confirm any prompts. WARNING: This will mean existing form definitions is the target directory will be overwritten without warning',
    })
    .help()
    .parseSync();
  const rootFolder = `${args.root ?? '../hrm-form-definitions/form-definitions'}/${
    args.definitionVersion
  }`;
  const rootDir = path.resolve(process.cwd(), rootFolder);
  console.log('Writing to:', rootDir);

  if (fs.existsSync(rootDir)) {
    if (!args.force) {
      prompt.start();
      const promptResult = await prompt.get([
        {
          name: 'overwriteDefinitions',
          description: 'Target directory (rootDir) not empty! Overwrite? (y/n)',
          required: true,
          pattern: /[yn]/g,
          message: 'Type Y (yes) or N (no)',
        },
      ]);
      if (promptResult.overwriteDefinitions !== 'y') {
        // eslint-disable-next-line no-console
        console.log('Aborting operation.');
        return;
      }
    }
  }

  processDefinitionFiles(aseloFormTemplates, async (definitionSpecification) => {
    console.log(`Generating ${definitionSpecification.definitionFilePath}`);
    let jsonToWrite: string | undefined;
    if (isFormDefinitionSpecification(definitionSpecification)) {
      const defaultForm = generateDefaultForm(definitionSpecification);
      jsonToWrite = JSON.stringify(defaultForm, null, 2);
    } else if (isDefinitionSpecification(definitionSpecification)) {
      const defaultItem = generateDefaultItem(definitionSpecification, {});
      if (defaultItem) {
        jsonToWrite = JSON.stringify(defaultItem, null, 2);
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

main().catch((err) => {
  throw err;
});
