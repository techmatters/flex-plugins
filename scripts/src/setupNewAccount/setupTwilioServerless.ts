import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { inspect } from 'util';
import { logError, logSuccess } from '../helpers/log';
import type { ScriptsInput } from './types';
// import { Octokit } from '@octokit/core';

const workflowTemplatePath = 'templates/serverless-workflow-template';

const replaceAll = (search: string, replacement: string) => (target: string) =>
  target.split(search).join(replacement);

const replacementFunctions = (input: ScriptsInput) => [
  replaceAll('<HELPLINE>', input.helpline),
  replaceAll('<SHORT_HELPLINE>', input.shortHelpline),
  replaceAll('<ENVIRONMENT>', input.environment),
  replaceAll('<SHORT_ENVIRONMENT>', input.shortEnvironment),
];

const replacePlaceholders = (input: ScriptsInput) => (target: string) =>
  replacementFunctions(input).reduce((accum, f) => f(accum), target);

const generateWorkflowContent = (input: ScriptsInput) => {
  const template = readFileSync(workflowTemplatePath).toString();
  const content = replacePlaceholders(input)(template);

  return content;
};

/**
 * Check that the template is in sync with Aselo Development deployment workflow
 */
const checkWorkflowInSync = async () => {
  const aseloDevConfig = {
    environment: 'Development',
    shortEnvironment: 'DEV',
    helpline: 'Aselo',
    shortHelpline: 'AS',
  };

  const response = await fetch(
    'https://raw.githubusercontent.com/techmatters/serverless/master/.github/workflows/aselo_development.yml',
  );
  const expected = await response.text();

  const generated = generateWorkflowContent(aseloDevConfig);

  if (expected !== generated)
    throw new Error(
      'The generated workflow file differs from the one being used by Aselo Development.',
    );
};

export const setupTwilioServerless = async (input: ScriptsInput) => {
  try {
    await checkWorkflowInSync();

    const fileName = 'new-workflow.yml'; // eventually this will be part of the input

    const content = generateWorkflowContent(input);
    writeFileSync(fileName, content);

    logSuccess(`New Serverless deploy workflow generated at ${fileName}!`);

    return fileName;
  } catch (err) {
    logError(`Error generating new workflow with input ${inspect(input)}: ${err}`);

    // Propagate the error
    throw err;
  }
};
