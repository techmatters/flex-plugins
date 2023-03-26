import { execSync } from 'child_process';
import { logDebug, logInfo } from '../helpers/log';

const TWILIO_TERRAFORM_ROOT_DIRECTORY = '/twilio-iac';

// TODO: is there a fancy way to do this with typescript based on the UseTerragruntParams and UseTerraformParams types?
export const TERRAFORM_REQUIRED_ARGS = ['helplineDirectory'];
export const TERRAGRUNT_REQUIRED_ARGS = ['helplineShortCode', 'helplineEnvironment', 'stage'];

type TerraformEnvironment = {
  HL: string;
  HL_ENV?: string;
};

enum TerraformCommand {
  TERRAFORM = 'terraform',
  TERRAGRUNT = 'terragrunt',
}

let terraformCommand: TerraformCommand;
let env: TerraformEnvironment;
let cwd: string;
let terraformVarFile: string;
let dryRun = false;

export type UseTerragruntParams = {
  helplineShortCode: string;
  helplineEnvironment: string;
  stage: string;
};

export const getTerraformRoot = (): string => {
  // We use the git root because it will work in both the docker container and locally from any subdirectory
  const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
  return `${repoRoot}${TWILIO_TERRAFORM_ROOT_DIRECTORY}`;
};

export const useTerragrunt = ({
  helplineShortCode,
  helplineEnvironment,
  stage,
}: UseTerragruntParams): void => {
  terraformCommand = TerraformCommand.TERRAGRUNT;
  env = {
    HL: helplineShortCode,
    HL_ENV: helplineEnvironment,
  };
  cwd = `${getTerraformRoot()}/stages/${stage}`;
};

export type UseTerraformParams = {
  helplineDirectory: string;
  varFile?: string;
};

export const useTerraform = ({ helplineDirectory, varFile }: UseTerraformParams): void => {
  terraformCommand = TerraformCommand.TERRAFORM;
  cwd = `${getTerraformRoot()}/${helplineDirectory}`;

  if (varFile) {
    terraformVarFile = varFile;
  }
};

export const setIsDryRun = (): void => {
  dryRun = true;
};

export const isDryRun = (): boolean => dryRun;

export const execTerraform = async (tfArgs?: string[]): Promise<void> => {
  if (!terraformCommand) {
    throw new Error('Terraform command not set, something went wrong with argv checks.');
  }

  if (terraformVarFile) {
    tfArgs?.push(`-var-file=${terraformVarFile}`);
  }

  const command = `${terraformCommand} ${tfArgs?.join(' ')}`;

  if (dryRun) {
    logDebug(`Would run command (from ${cwd}):`);
    logInfo(command);
    return;
  }

  logDebug(`Running command (from ${cwd}):`, command);
  execSync(command, { cwd, env });
};
