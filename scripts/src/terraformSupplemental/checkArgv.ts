import { TERRAFORM_REQUIRED_ARGS, TERRAGRUNT_REQUIRED_ARGS } from './execTerraform';

const validateTerraformArgs = (argv: any): void => {
  if (!Object.prototype.hasOwnProperty.call(argv, 'requireTerraform')) return;

  const useTerraform = TERRAFORM_REQUIRED_ARGS.every(
    (arg) => Object.prototype.hasOwnProperty.call(argv, arg) && !!argv[arg],
  );

  const useTerragrunt = TERRAGRUNT_REQUIRED_ARGS.every(
    (arg) => Object.prototype.hasOwnProperty.call(argv, arg) && !!argv[arg],
  );

  if (useTerraform && useTerragrunt) {
    throw new Error(
      'You must provide ONLY a helpline account directory (hl_ad) for terraform OR a helpline, helpline environment, and stage (hl, hl_env, st) for terragrunt to run this command.',
    );
  }

  if (!useTerraform && !useTerragrunt) {
    throw new Error(
      'You must provide either a helpline account directory (hl_ad) for terraform or a helpline, helpline environment, and stage (hl, hl_env, st) for terragrunt to run this command.',
    );
  }
};

export const checkArgv = (argv: object): boolean => {
  validateTerraformArgs(argv);

  return true;
};
