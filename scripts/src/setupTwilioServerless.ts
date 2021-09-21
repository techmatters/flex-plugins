import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import type { ConstantState } from './createTwilioResources';
// import { Octokit } from '@octokit/core';

const workflowTemplatePath = 'templates/serverless-workflow-template';

const replaceAll = (search: string, replacement: string) => (target: string) =>
  target.split(search).join(replacement);

const replacementFunctions = (state: ConstantState) => [
  replaceAll('<HELPLINE>', state.helpline),
  replaceAll('<SHORT_HELPLINE>', state.shortHelpline),
  replaceAll('<ENVIRONMENT>', state.environment),
  replaceAll('<SHORT_ENVIRONMENT>', state.shortEnvironment),
];

const replacePlaceholders = (state: ConstantState) => (target: string) =>
  replacementFunctions(state).reduce((accum, f) => f(accum), target);

const generateWorkflowContent = (state: ConstantState) => {
  const template = readFileSync(workflowTemplatePath).toString();
  const content = replacePlaceholders(state)(template);

  return content;
};

const aseloDevConfig = {
  environment: 'Development',
  shortEnvironment: 'DEV',
  helpline: 'Aselo',
  shortHelpline: 'AS',
};
const checkWorkflowInSync = async () => {
  const response = await fetch(
    'https://raw.githubusercontent.com/techmatters/serverless/master/.github/workflows/aselo_development.yml',
  );
  const expected = await response.text();

  const generated = generateWorkflowContent(aseloDevConfig);

  // const generatedContent = generateWorkflowContent();

  console.log('Workflow tempalte is up to date?: ', expected === generated);

  if (expected !== generated)
    throw new Error(
      'The generated workflow file differs from the one being used by Aselo Development.',
    );
};

export const setupTwilioServerless = async (state: ConstantState) => {
  await checkWorkflowInSync();

  const content = generateWorkflowContent(state);
  const fileName = 'new-workflow.yml';
  writeFileSync(fileName, content);
};

setupTwilioServerless(aseloDevConfig);
