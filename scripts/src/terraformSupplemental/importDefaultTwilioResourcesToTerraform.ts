import twilio from 'twilio';
import { execTerraform } from './execTerraform';
import { logDebug, logInfo, logWarning } from '../helpers/log';
import { attemptTerraformImport } from './twilioToTerraformImporter';

export async function importDefaultResources(account: string) {
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
      await attemptTerraformImport(
        `${workspaceSid}/${taskChannel.sid}`,
        `module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.task_channel["${taskChannelUniqueName}"]`,
        { description: `${taskChannelUniqueName} task channel` },
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
      await attemptTerraformImport(
        `${flexFlow.sid}`,
        `module.flex.twilio_flex_flex_flows_v1.${terraformResourceName}`,
        { description: `${flexFlowFriendlyName} flex flow` },
      );
    } else {
      logWarning(`${flexFlowFriendlyName} flex flow not found to import`);
    }
  }

  await execTerraform(['init']);
  const proxy = (await client.proxy.services.list({ limit: 20 })).find(
    (p) => p.uniqueName === 'Flex Proxy Service',
  );
  if (proxy) {
    await attemptTerraformImport(
      proxy.sid,
      'module.services.twilio_proxy_services_v1.flex_proxy_service',
      {
        description: 'Flex Proxy Service',
      },
    );
  } else {
    logWarning('Flex proxy Service not found to import');
  }

  let chatServiceSid;

  logInfo('Trying to import chatServiceInstanceSid from Flex Service Configuration');
  chatServiceSid = (await client.flexApi.configuration.get().fetch()).chatServiceInstanceSid;

  if (!chatServiceSid) {
    logWarning('Flex Service Configuration missing chatServiceInstanceSid');
    logInfo('Trying to import Flex Chat Service');
    chatServiceSid = (await client.chat.services.list({ limit: 20 })).find(
      (p) => p.friendlyName === 'Flex Chat Service',
    )?.sid;
  }

  if (!chatServiceSid) {
    logWarning('Flex Chat Service not found to import');
    logInfo('Trying to import Flex Conversation Service');
    chatServiceSid = (await client.chat.services.list({ limit: 20 })).find(
      (p) => p.friendlyName === 'Flex Conversation Service',
    )?.sid;
  }

  if (chatServiceSid) {
    await attemptTerraformImport(
      chatServiceSid,
      'module.services.twilio_chat_services_v2.flex_chat_service',
      {
        description: 'Flex Chat Service',
      },
    );
  } else {
    logWarning('Flex Chat Service not found to import');
  }
  const workspace = (await client.taskrouter.workspaces.list({ limit: 20 })).find(
    (p) => p.friendlyName === 'Flex Task Assignment',
  );

  if (workspace) {
    await attemptTerraformImport(
      workspace.sid,
      'module.taskRouter.twilio_taskrouter_workspaces_v1.flex_task_assignment',
      {
        description: 'Flex Task Assignment workflow',
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

}
