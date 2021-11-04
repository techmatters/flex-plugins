import prompt from 'prompt';
import { ScriptsInput, environments, shortEnvironments } from './types';
import { createTwilioResources } from './createTwilioResources';
import { logSuccess, logError } from '../helpers/log';
import { generateWorkflow } from './workflowGenerator';
import flexPluginsConfig from '../workflows/flex-plugins.json';
import serverlessConfig from '../workflows/serverless.json';

require('dotenv').config();

const promptSchema = [
  {
    name: 'createTwilioResources',
    description: 'Run createTwilioResources script? (y/n)',
    required: true,
    pattern: /y|n/g,
    message: 'Type Y (yes) or N (no)',
  },
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
  if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID missing, check env vars.');
  if (!process.env.AWS_SECRET_ACCESS_KEY)
    throw new Error('AWS_SECRET_ACCESS_KEY missing, check env vars.');
  if (!process.env.TWILIO_ACCOUNT_SID)
    throw new Error('TWILIO_ACCOUNT_SID missing, check env vars.');
  if (!process.env.TWILIO_AUTH_TOKEN) throw new Error('TWILIO_AUTH_TOKEN missing, check env vars.');
  if (!process.env.HELPLINE) throw new Error('HELPLINE missing, check env vars.');
  if (!process.env.SHORT_HELPLINE) throw new Error('SHORT_HELPLINE missing, check env vars.');
  if (!process.env.ENVIRONMENT) throw new Error('ENVIRONMENT missing, check env vars.');
  if (!process.env.DATADOG_APP_ID) throw new Error('DATADOG_APP_ID missing, check env vars.');
  if (!process.env.DATADOG_ACCESS_TOKEN)
    throw new Error('DATADOG_ACCESS_TOKEN missing, check env vars.');
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

    if (promptResult.createTwilioResources === 'y') {
      logSuccess('Running createTwilioResources script..');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const twilioResources = await createTwilioResources(input);
    }

    if (promptResult.generateServerlessDeploymentFile === 'y') {
      logSuccess('Generating serverless deployment file...');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await generateWorkflow(input, serverlessConfig);
    }

    if (promptResult.generateFlexPluginsDeploymentFile === 'y') {
      logSuccess('Generating flex-plugins deployment file...');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await generateWorkflow(input, flexPluginsConfig);
    }

    logSuccess('Setup script completed successfully!');
  });
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});
