import { execSync } from 'child_process';
import { logDebug, logInfo } from '../helpers/log';

// TODO: use root of repo instead of relative path
const TWILIO_TERRAFORM_ROOT_DIRECTORY = '../twilio-iac';

// TODO: is there a fancy way to do this with typescript based on the UseTerragruntParams and UseTerraformParams types?
export const TERRAFORM_REQUIRED_ARGS = ['helplineDirectory'];
export const TERRAGRUNT_REQUIRED_ARGS = ['helpline', 'helplineEnvironment', 'stage'];

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
  helpline: string;
  helplineEnvironment: string;
  stage: string;
};

export const useTerragrunt = ({
  helpline,
  helplineEnvironment,
  stage,
}: UseTerragruntParams): void => {
  terraformCommand = TerraformCommand.TERRAGRUNT;

  env = {
    HL: helpline,
    HL_ENV: helplineEnvironment,
  };
  cwd = `${TWILIO_TERRAFORM_ROOT_DIRECTORY}/stages/${stage}`;
};

export type UseTerraformParams = {
  helplineDirectory: string;
  varFile?: string;
};

export const useTerraform = ({ helplineDirectory, varFile }: UseTerraformParams): void => {
  terraformCommand = TerraformCommand.TERRAFORM;
  cwd = `${TWILIO_TERRAFORM_ROOT_DIRECTORY}/${helplineDirectory}`;
  if (varFile) {
    terraformVarFile = varFile;
  }
};

export const isDryRun = (): void => {
  dryRun = true;
};

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
