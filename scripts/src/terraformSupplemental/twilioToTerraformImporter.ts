import { execSync } from 'child_process';
import { logSuccess, logWarning } from '../helpers/log';

const TWILIO_TERRAFORM_ROOT_DIRECTORY = '../twilio-iac';

type AttemptTerraformImportOptions = {
  description: string;
  tfvarsFile: string;
  dryRun: boolean;
};

export function attemptTerraformImport(
  twilioResourceSid: string,
  terraformResource: string,
  account: string,
  {
    description = `${terraformResource} '${twilioResourceSid}'`,
    tfvarsFile,
    dryRun = false,
  }: Partial<AttemptTerraformImportOptions> = {},
): void {
  const cwd = `${TWILIO_TERRAFORM_ROOT_DIRECTORY}/${account}`;
  const tfVarsArg = tfvarsFile ? `-var-file ${tfvarsFile}` : '';
  const command = `terraform import ${tfVarsArg} ${terraformResource} ${twilioResourceSid}`;
  if (dryRun) {
    logSuccess(`Would run command (from ${cwd}):`);
    logSuccess(command);
  } else {
    try {
      logSuccess(`Running command: ${command} (from ${cwd})`);
      execSync(command, { cwd });
    } catch (error) {
      if ((<any>error).stderr?.toString().includes('Resource already managed by Terraform')) {
        logWarning(`${description} already in terraform, moving on.`);
      } else throw error;
    }
    logSuccess(
      `${description}, sid ${twilioResourceSid} successfully imported to terraform as '${terraformResource}'`,
    );
  }
}
