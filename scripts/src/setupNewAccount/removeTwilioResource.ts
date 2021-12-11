import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { Twilio } from 'twilio';
import { logWarning } from '../helpers/log';

/**
 * Type aliases defined to work with different types of Twilio resource generically
 * No such types exist in the Twilio API itself, they are all just unrelated types with the same stuff defined on them.
 */
type TwilioResource = { remove: () => void; sid: string; friendlyName: string };

type ResourceListOptions = { limit: number | undefined };

type ResourceListFunction<T extends TwilioResource> = (opts: ResourceListOptions) => Promise<T[]>;
/**
 * Generic function for removing a Twlio resource by searching for it by the friendly name used to create it
 * @param resourceFriendlyName - the 'friendly name' used in the Twilio GUI - used to locate the specific resource from a list of all resources of that type.
 * @param resourceTypeDescription - a string just used in logs to differentiate the resource from others in the script.
 * @param resourceGetter - A function to return the resource type provided a workspace instance, e.g. () => client.sync.services
 */
export const removeResource = async <T extends TwilioResource>(
  resourceFriendlyName: string,
  resourceTypeDescription: string,
  resourceGetter: () => { list: ResourceListFunction<T> },
): Promise<void> => {
  const resource = (await resourceGetter().list({ limit: 20 })).find(
    (key) => key.friendlyName === resourceFriendlyName,
  );
  if (resource) {
    await resource.remove();
    logWarning(`Twilio resource: Successfully removed ${resourceTypeDescription} ${resource.sid}`);
  }
};

/**
 * Generic function for removing a resource that is part of the flex workspace
 * @param client
 * @param workspaceSid
 * @param resourceFriendlyName - the 'friendly name' used in the Twilio GUI - used to try to locate the resource.
 * @param resourceTypeDescription - a string just used in logs to differentiate the resource from others in the script.
 * @param resourceGetter - A function to return the resource type provided a workspace instance, e.g. workspace => workspace.workflows
 */
export const removeWorkspaceResource = async <T extends TwilioResource>(
  client: Twilio,
  workspaceSid: string | undefined,
  resourceFriendlyName: string,
  resourceTypeDescription: string,
  resourceGetter: (ws: WorkspaceContext) => { list: ResourceListFunction<T> },
): Promise<void> => {
  if (!workspaceSid)
    throw new Error(
      `Flex Task Assignment Workspace not found while trying to remove the ${resourceTypeDescription}.`,
    );
  const workspace = await client.taskrouter.workspaces(workspaceSid);
  await removeResource<T>(resourceFriendlyName, resourceTypeDescription, () =>
    resourceGetter(workspace),
  );
};
