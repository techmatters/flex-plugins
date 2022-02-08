import { execSync } from 'child_process';
import { logDebug, logInfo, logSuccess, logWarning } from '../helpers/log';

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
  let terraformResourceArg = terraformResource
    .replace(/\s/g, process.platform === 'win32' ? ' ' : '\\ ')
    // Bit of a crappy check - should really be based on shell being used rather than OS
    // Assumes windows uses win32 and everything else is bash.
    .replace(/"/g, process.platform === 'win32' ? '\\"' : '"');
  if (process.platform === 'win32') {
    terraformResourceArg = `"${terraformResourceArg}"`;
  }
  const command = `terraform import ${tfVarsArg} ${terraformResourceArg} ${twilioResourceSid}`;
  if (dryRun) {
    logDebug(`Would run command (from ${cwd}):`);
    logInfo(command);
  } else {
    try {
      logDebug(`Running command (from ${cwd}):`, command);
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
