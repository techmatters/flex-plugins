import { Twilio } from 'twilio';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { newErr, newOk, Result } from '../Result';
import type { CallInstance } from 'twilio/lib/rest/api/v2010/account/call';
import { CallSid, TaskSID } from '@tech-matters/twilio-types';

type ChangeTaskAndCallStatusResult = Result<
  { cause: Error },
  { updatedTask: TaskInstance; updatedCall?: CallInstance }
>;

export const updateTaskAndCallStatus = async (
  client: Twilio,
  task: TaskInstance,
  targetStatus: TaskInstance['assignmentStatus'] & CallInstance['status'],
): Promise<ChangeTaskAndCallStatusResult> => {
  try {
    const attributes = JSON.parse(task.attributes);
    const callSid = attributes?.call_sid;
    console.debug(`Updating ${task.sid} to status ${targetStatus}`);
    // Ends the task for the worker and client for chat tasks, and only for the worker for voice tasks
    const updatedTask = await task.update({
      assignmentStatus: targetStatus,
    });
    console.info(`Updated task ${task.sid} to status ${targetStatus}`);
    // Update the call for the client for voice
    if (callSid) {
      try {
        console.info(`Updating call ${callSid} to status ${targetStatus}`);
        const updatedCall = await client.calls(callSid).update({ status: targetStatus });
        console.info(`Updated call ${callSid} to status ${targetStatus}`);
        return newOk({ updatedTask, updatedCall });
      } catch (error) {
        console.error(`Failed to call ${callSid} to status ${targetStatus}`, error);
      }
    }
    return newOk({ updatedTask });
  } catch (err) {
    const error = err as Error;
    return newErr({
      message: error.message,
      error: { cause: error },
    });
  }
};

type RemoveTaskAndCallResult = Result<
  { cause: Error },
  { removedTaskSid: TaskSID; removedCallSid?: CallSid }
>;

export const removeTaskAndCall = async (
  client: Twilio,
  task: TaskInstance,
): Promise<RemoveTaskAndCallResult> => {
  try {
    const attributes = JSON.parse(task.attributes);
    const callSid = attributes?.call_sid as CallSid;
    console.debug(`Removing ${task.sid}`);
    // Ends the task for the worker and client for chat tasks, and only for the worker for voice tasks
    const isTaskRemoved = await task.remove();
    if (!isTaskRemoved) {
      const message = `Call to remove ${task.sid} returned false`;
      return newErr({ message, error: { cause: new Error(message) } });
    }
    console.info(`Removed task ${task.sid}`);
    // Remove the call for the client for voice
    if (callSid) {
      try {
        console.info(`Removing call ${callSid}`);
        const isCallRemoved = await client.calls(callSid).remove();
        if (isCallRemoved) {
          console.info(`Removed call ${callSid}`);
          return newOk({ removedTaskSid: task.sid as TaskSID, removedCallSid: callSid });
        }
        console.error(`Failed to remove call ${callSid} - remove call returned false`);
      } catch (error) {
        console.error(`Failed to remove call ${callSid}`, error);
      }
    }
    return newOk({ removedTaskSid: task.sid as TaskSID });
  } catch (err) {
    const error = err as Error;
    return newErr({
      message: error.message,
      error: { cause: error },
    });
  }
};
