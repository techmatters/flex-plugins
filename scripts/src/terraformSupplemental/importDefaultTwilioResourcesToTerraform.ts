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
    logSuccess(
      `${description}, sid ${twilioResourceSid} successfully imported to terraform as '${terraformResource}'`,
    );
  } catch (error) {
    if ((<any>error).stderr.toString().includes('Resource already managed by Terraform')) {
      logWarning(`${description} already in terraform, moving on.`);
    } else throw error;
  }
}

async function locateAndImportDefaultTaskChannel(
  workspaceSid: string,
  taskChannelUniqueName: string,
): Promise<void> {
  const taskChannel = (
    await client.taskrouter.workspaces(workspaceSid).taskChannels.list({ limit: 50 })
  ).find((tc) => tc.uniqueName === taskChannelUniqueName);

  if (taskChannel) {
    attemptTerraformImport(
      `${workspaceSid}/${taskChannel.sid}`,
      `twilio_taskrouter_workspaces_task_channels_v1.${taskChannelUniqueName}`,
      `${taskChannelUniqueName} task channel`,
    );
  } else {
    logWarning(`${taskChannelUniqueName} task channel not found to import`);
  }
}
async function locateAndImportDefaultFlexFlow(
  flexFlowFriendlyName: string,
  terraformResourceName: string,
): Promise<void> {
  const flexFlow = (await client.flexApi.flexFlow.list({ limit: 50 })).find(
    (tc) => tc.friendlyName === flexFlowFriendlyName,
  );

  if (flexFlow) {
    attemptTerraformImport(
      `${flexFlow.sid}`,
      `twilio_flex_flex_flows_v1.${terraformResourceName}`,
      `${flexFlowFriendlyName} flex flow`,
    );
  } else {
    logWarning(`${flexFlowFriendlyName} flex flow not found to import`);
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
    await locateAndImportDefaultTaskChannel(workspace.sid, 'default');
    await locateAndImportDefaultTaskChannel(workspace.sid, 'voice');
    await locateAndImportDefaultTaskChannel(workspace.sid, 'chat');
    await locateAndImportDefaultTaskChannel(workspace.sid, 'sms');
    await locateAndImportDefaultTaskChannel(workspace.sid, 'video');
    await locateAndImportDefaultTaskChannel(workspace.sid, 'email');
  } else {
    logWarning('Flex Task Assignment workflow not found to import');
  }

  await locateAndImportDefaultFlexFlow('Flex Messaging Channel Flow', 'messaging_flow');
  await locateAndImportDefaultFlexFlow('Flex Web Channel Flow', 'webchat_flow');
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});
