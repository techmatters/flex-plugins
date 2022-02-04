import twilio from 'twilio';
import { execSync } from 'child_process';
import { logDebug, logInfo, logWarning } from '../helpers/log';
import { attemptTerraformImport } from './twilioToTerraformImporter';

const TERRAFORM_ROOT_DIRECTORY = '../twilio-iac';

export async function importDefaultResources(
  account: string,
  tfvarsFile?: string,
  dryRun: boolean = false,
) {
  logDebug(`Importing default resources for '${account}'.`);

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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
        account,
        { description: `${taskChannelUniqueName} task channel`, tfvarsFile, dryRun },
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
        account,
        { description: `${flexFlowFriendlyName} flex flow`, tfvarsFile, dryRun },
      );
    } else {
      logWarning(`${flexFlowFriendlyName} flex flow not found to import`);
    }
  }

  if (dryRun) {
    logInfo('================== DRY RUN ==================');
    logInfo('No imports will be performed, command outputs are what would have been run.');
  }

  execSync(`terraform init${tfvarsFile ? ` --var-file ${tfvarsFile}` : ''}`, {
    cwd: `${TERRAFORM_ROOT_DIRECTORY}/${account}`,
  });
  const proxy = (await client.proxy.services.list({ limit: 20 })).find(
    (p) => p.uniqueName === 'Flex Proxy Service',
  );
  if (proxy) {
    attemptTerraformImport(proxy.sid, 'twilio_proxy_services_v1.flex_proxy_service', account, {
      description: 'Flex Proxy Service',
      tfvarsFile,
      dryRun,
    });
  } else {
    logWarning('Flex proxy Service not found to import');
  }

  const chatService = (await client.chat.services.list({ limit: 20 })).find(
    (p) => p.friendlyName === 'Flex Chat Service',
  );

  if (chatService) {
    attemptTerraformImport(chatService.sid, 'twilio_chat_services_v2.flex_chat_service', account, {
      description: 'Flex Chat Service',
      tfvarsFile,
      dryRun,
    });
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
      account,
      {
        description: 'Flex Task Assignment workflow',
        tfvarsFile,
        dryRun,
      },
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
