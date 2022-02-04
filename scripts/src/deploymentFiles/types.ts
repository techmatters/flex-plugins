export type ScriptsInput = {
  helpline: string;
  shortHelpline: string;
  environment: string;
  shortEnvironment: string;
};

/**
 * Naming convention we use for the envionments.
 */
export const environments = ['Development', 'Staging', 'Production'];
export const shortEnvironments = { Development: 'DEV', Staging: 'STG', Production: 'PROD' } as {
  [env: string]: string;
};
