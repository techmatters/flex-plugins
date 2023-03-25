import { execTerraform } from './execTerraform';
import { logSuccess, logWarning } from '../helpers/log';

type AttemptTerraformImportOptions = {
  description: string;
};

export async function attemptTerraformImport(
  twilioResourceSid: string,
  terraformResource: string,
  {
    description = `${terraformResource} '${twilioResourceSid}'`,
  }: Partial<AttemptTerraformImportOptions> = {},
): Promise<void> {
  let terraformResourceArg = terraformResource
    // .replace(/\s/g, process.platform === 'win32' ? ' ' : '\\ ')
    .replace(/\s/g, ' ')
    // Bit of a crappy check - should really be based on shell being used rather than OS
    // Assumes windows uses win32 and everything else is bash.
    // .replace(/"/g, process.platform === 'win32' ? '\\"' : '"');
    .replace(/"/g, '\\"');
  // if (process.platform === 'win32') {
  terraformResourceArg = `"${terraformResourceArg}"`;
  // }
  try {
    await execTerraform(['import', terraformResourceArg, twilioResourceSid]);
  } catch (error) {
    if ((<any>error).stderr?.toString().includes('Resource already managed by Terraform')) {
      logWarning(`${description} already in terraform, moving on.`);
    } else throw error;
  }
  logSuccess(
    `${description}, sid ${twilioResourceSid} successfully imported to terraform as '${terraformResource}'`,
  );
}
