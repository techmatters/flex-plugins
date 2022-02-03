import prompt from 'prompt';
import { ScriptsInput, environments, shortEnvironments } from './types';
import { logSuccess, logError } from '../helpers/log';
import { generateWorkflow } from './workflowGenerator';
import flexPluginsConfig from '../workflows/flex-plugins.json';
import serverlessConfig from '../workflows/serverless.json';

require('dotenv').config();

const promptSchema = [
  {
    name: 'generateServerlessDeploymentFile',
    description: 'Generate serverless deployment file? (y/n)',
    required: true,
    pattern: /y|n/g,
    message: 'Type Y (yes) or N (no)',
  },
  {
    name: 'generateFlexPluginsDeploymentFile',
    description: 'Generate flex-plugins deployment file? (y/n)',
    required: true,
    pattern: /y|n/g,
    message: 'Type Y (yes) or N (no)',
  },
];

async function main() {
  // Validate the input before calling the scripts
  if (!process.env.HELPLINE) throw new Error('HELPLINE missing, check env vars.');
  if (!process.env.SHORT_HELPLINE) throw new Error('SHORT_HELPLINE missing, check env vars.');
  if (!process.env.ENVIRONMENT) throw new Error('ENVIRONMENT missing, check env vars.');
  if (!environments.includes(process.env.ENVIRONMENT))
    throw new Error(
      `Invalid ENVIRONMENT provided, it must be one of ${environments}, check env vars.`,
    );

  const input: ScriptsInput = {
    helpline: process.env.HELPLINE,
    shortHelpline: process.env.SHORT_HELPLINE,
    environment: process.env.ENVIRONMENT,
    shortEnvironment: shortEnvironments[process.env.ENVIRONMENT],
  };

  prompt.start();
  prompt.get(promptSchema, async (err, promptResult) => {
    if (err) throw new Error(`Input error: ${err}`);

    if (promptResult.generateServerlessDeploymentFile === 'y') {
      logSuccess('Generating serverless.tf deployment file...');
      await generateWorkflow(input, serverlessConfig);
    }

    if (promptResult.generateFlexPluginsDeploymentFile === 'y') {
      logSuccess('Generating flex-plugins deployment file...');
      await generateWorkflow(input, flexPluginsConfig);
    }

    logSuccess('Generate deployment files completed successfully!');
  });
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});
