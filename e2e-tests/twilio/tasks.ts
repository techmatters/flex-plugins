// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

export const deleteAllTasksInQueue = async (
  workspaceName: string,
  workflowName: string,
  taskQueueName: string,
): Promise<void> => {
  const workspace = (
    await twilioClient.taskrouter.workspaces.list({
      friendlyName: workspaceName,
    })
  )[0];
  if (!workspace) {
    throw new Error(`Workspace with friendly name '${workspaceName}' not found.`);
  }
  const tasksInQueue = await workspace.tasks().list({
    workflowName,
    taskQueueName,
  });
  await Promise.all(
    tasksInQueue.map((t) => {
      console.log(`Removing task ${t.sid}`);
      return t.remove();
    }),
  );
};
