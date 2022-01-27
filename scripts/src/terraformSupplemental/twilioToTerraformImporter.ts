import { execSync } from 'child_process';
import { logSuccess, logWarning } from '../helpers/log';

const TWILIO_TERRAFORM_ROOT_DIRECTORY = '../twilio-iac/aselo-terraform';

type AttemptTerraformImportOptions = {
  description: string;
  tfvarsFile: string;
};

export function attemptTerraformImport(
  twilioResourceSid: string,
  terraformResource: string,
  account: string,
  {
    description = `${terraformResource} '${twilioResourceSid}'`,
    tfvarsFile,
  }: Partial<AttemptTerraformImportOptions> = {},
): void {
  const cwd = `${TWILIO_TERRAFORM_ROOT_DIRECTORY}/${account}`;
  const tfVarsArg = tfvarsFile ? `-var-file ${tfvarsFile}` : '';
  try {
    const command = `terraform import ${tfVarsArg} ${terraformResource} ${twilioResourceSid}`;
    logSuccess(`Running command: ${command}`);
    execSync(command, { cwd });
    logSuccess(
      `${description}, sid ${twilioResourceSid} successfully imported to terraform as '${terraformResource}'`,
    );
  } catch (error) {
    if ((<any>error).stderr.toString().includes('Resource already managed by Terraform')) {
      logWarning(`${description} already in terraform, moving on.`);
    } else throw error;
  }
}
