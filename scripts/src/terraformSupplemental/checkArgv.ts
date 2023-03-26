import { TERRAFORM_REQUIRED_ARGS, TERRAGRUNT_REQUIRED_ARGS } from './execTerraform';

const validateTerraformArgs = (argv: any): void => {
  // We add a hidden `requireTerraform` arg all commands that depend on terraform,
  // so if it's not present, we can skip this validation.
  if (!Object.prototype.hasOwnProperty.call(argv, 'requireTerraform')) return;

  const isTerraform = TERRAFORM_REQUIRED_ARGS.every((arg) => !!argv[arg]);
  const isTerragrunt = TERRAGRUNT_REQUIRED_ARGS.every((arg) => !!argv[arg]);

  const errorPostfix = `args required for terraform (${TERRAFORM_REQUIRED_ARGS.concat(
    ', ',
  )}) for terraform OR args required for terragrunt (${TERRAGRUNT_REQUIRED_ARGS.concat(
    ', ',
  )}) to run this command.`;

  if (isTerraform && isTerragrunt) {
    throw new Error(`Invalid Terraform Args: You must provide ONLY ${errorPostfix}`);
  }

  if (!isTerraform && !isTerragrunt) {
    throw new Error(`Terraform Args Required: You must provide EITHER ${errorPostfix}`);
  }
};

export const checkArgv = (argv: object): boolean => {
  validateTerraformArgs(argv);

  return true;
};
