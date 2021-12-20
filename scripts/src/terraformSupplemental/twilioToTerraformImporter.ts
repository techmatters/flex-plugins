import { execSync } from 'child_process';
import { logSuccess, logWarning } from '../helpers/log';

const DEFAULT_TERRAFORM_WORKING_DIRECTORY = '../twilio-iac/aselo-terraform';

export function attemptTerraformImport(
  twilioResourceSid: string,
  terraformResource: string,
  description: string = `${terraformResource} '${twilioResourceSid}'`,
  cwd: string = DEFAULT_TERRAFORM_WORKING_DIRECTORY,
): void {
  try {
    const command = `terraform import -var-file ${
      process.argv[2] || 'poc-private.tfvars'
    } ${terraformResource} ${twilioResourceSid}`;
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
