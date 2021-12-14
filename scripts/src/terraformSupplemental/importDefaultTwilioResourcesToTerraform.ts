import twilio from 'twilio';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { logError, logSuccess, logWarning } from '../helpers/log';

config();

const TERRAFORM_WORKING_DIRECTORY = '../twilio-iac/aselo-internal';

logSuccess(fs.realpathSync(TERRAFORM_WORKING_DIRECTORY));
logSuccess(process.env.TWILIO_ACCOUNT_SID);
logSuccess(process.env.TWILIO_AUTH_TOKEN);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function attemptTerraformImport(
  twilioResourceSid: string,
  terraformResource: string,
  description: string,
): void {
  try {
    execSync(
      `terraform import -var-file poc-private.tfvars ${terraformResource} ${twilioResourceSid}`,
      { cwd: TERRAFORM_WORKING_DIRECTORY },
    );
  } catch (error) {
    if ((<any>error).stderr.toString().includes('Resource already managed by Terraform')) {
      logWarning(`${description} already in terraform, moving on.`);
    } else throw error;
  }
}

async function main() {
  execSync('terraform init', { cwd: TERRAFORM_WORKING_DIRECTORY });
  const proxy = (await client.proxy.services.list({ limit: 20 })).find(
    (p) => p.uniqueName === 'Flex Proxy Service',
  );
  if (proxy) {
    attemptTerraformImport(
      proxy.sid,
      'twilio_proxy_services_v1.flex_proxy_service',
      'Flex Proxy Service',
    );
    try {
      execSync(
        `terraform import -var-file poc-private.tfvars twilio_proxy_services_v1.flex_proxy_service ${proxy.sid}`,
        { cwd: TERRAFORM_WORKING_DIRECTORY },
      );
    } catch (error) {
      if ((<any>error).stderr.toString().includes('Resource already managed by Terraform')) {
        logWarning('Flex Proxy Service already in terraform, moving on.');
      } else throw error;
    }
  } else {
    logWarning('Flex proxy Service not found to import');
  }

  const chatService = (await client.chat.services.list({ limit: 20 })).find(
    (p) => p.friendlyName === 'Flex Chat Service',
  );

  if (chatService) {
    attemptTerraformImport(
      chatService.sid,
      'twilio_chat_services_v2.flex_chat_service',
      'Flex Chat Service',
    );
  } else {
    logWarning('Flex Chat Service not found to import');
  }
  const workspace = (await client.taskrouter.workspaces.list({ limit: 20 })).find(
    (p) => p.friendlyName === 'Flex Task Assignment',
  );

  if (workspace) {
    attemptTerraformImport(
      workspace.sid,
      'twilio_taskrouter_workspaces_v1.flex_task_assignment',
      'Flex Task Assignment workflow',
    );
  } else {
    logWarning('Flex Task Assignment workflow not found to import');
  }
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});
