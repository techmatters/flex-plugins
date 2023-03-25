import { TERRAFORM_REQUIRED_ARGS, TERRAGRUNT_REQUIRED_ARGS } from './execTerraform';

const validateTerraformArgs = (argv: {}) => {
  if (!Object.prototype.hasOwnProperty.call(argv, 'requireTerraform')) return;

  const useTerraform = TERRAFORM_REQUIRED_ARGS.every((arg) =>
    Object.prototype.hasOwnProperty.call(argv, arg),
  );

  const useTerragrunt = TERRAGRUNT_REQUIRED_ARGS.every((arg) =>
    Object.prototype.hasOwnProperty.call(argv, arg),
  );

  if (useTerraform && useTerragrunt) {
    throw new Error(
      'You must provide either a helpline account directory (hl_ad) or a helpline, helpline environment, and stage (hl, hl_env, st) to run this command.',
    );
  }

  if (!useTerraform && !useTerragrunt) {
    throw new Error(
      'You must provide either a helpline account directory (hl_ad) or a helpline, helpline environment, and stage (hl, hl_env, st) to run this command.',
    );
  }
};

export const checkArgv = (argv: object): void => {
  validateTerraformArgs(argv);
};
