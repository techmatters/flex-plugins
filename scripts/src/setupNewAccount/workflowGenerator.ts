import fetch from 'node-fetch';
import { readFileSync, writeFileSync } from 'fs';
import { inspect } from 'util';
import { logSuccess, logError } from '../helpers/log';
import type { ScriptsInput } from './types';

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

const generateWorkflowContent = (input: ScriptsInput, workflowTemplatePath: string) => {
  const template = readFileSync(workflowTemplatePath).toString();
  const content = replacePlaceholders(input)(template);

  return content;
};

type WorkflowConfig = {
  fileName: string;
  workflowTemplatePath: string;
  remoteUrl: string;
};

export const checkWorkflowInSync = async (remoteUrl: string, templatePath: string) => {
  const aseloDevConfig = {
    environment: 'Development',
    shortEnvironment: 'DEV',
    helpline: 'Aselo',
    shortHelpline: 'AS',
  };

  const response = await fetch(remoteUrl);
  const expected = await response.text();

  const generated = generateWorkflowContent(aseloDevConfig, templatePath);

  if (expected !== generated)
    logError(
      'The generated workflow file differs from the one being used by Aselo Development.',
    );
};

/**
 * Generates a workflow deployment file given a workflow configuration.
 *
 * @param input scripts input
 * @param config workflow configuration
 * @returns file name of the generated file
 */
export const generateWorkflow = async (input: ScriptsInput, config: WorkflowConfig) => {
  try {
    const { fileName, workflowTemplatePath, remoteUrl } = config;
    await checkWorkflowInSync(remoteUrl, workflowTemplatePath);

    const content = generateWorkflowContent(input, workflowTemplatePath);
    writeFileSync(fileName, content);
    logSuccess(`New deploy workflow generated at ${fileName}!`);

    return fileName;
  } catch (err) {
    logError(`Error generating new workflow with input ${inspect(input)}: ${err}`);

    // Propagate the error
    throw err;
  }
};
