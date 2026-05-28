/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { AccountSID, TaskSID, WorkspaceSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import type RestException from 'twilio/lib/base/RestException';
import { ErrorResult, newErr, newOk, Result } from '../Result';

const MAX_ATTEMPTS = 10;

type ErrorResultPayload = {
  accountSid: AccountSID;
  taskSid: TaskSID;
  errorInstance: Error;
  step: 'fetch' | 'update';
};

type MissingTaskErrorResultPayload = ErrorResultPayload & {
  workspaceSid: WorkspaceSID;
};

type PreconditionFailedErrorResultPayload = ErrorResultPayload & {
  etag: string | null;
  step: 'update';
};

const newErrorResult = <
  T extends
    | ErrorResultPayload
    | MissingTaskErrorResultPayload
    | PreconditionFailedErrorResultPayload,
>(
  payload: T,
): ErrorResult<T> => {
  const errorMessage = `[${payload.accountSid}/${payload.taskSid}] Error in patchTaskAttributes when trying to ${payload.step} it.`;
  return newErr({
    message: errorMessage,
    error: payload,
  });
};

const missingTaskError = (
  payload: MissingTaskErrorResultPayload,
): ErrorResult<MissingTaskErrorResultPayload> => {
  const result = newErrorResult<MissingTaskErrorResultPayload>(payload);
  const errorMessage = `[${payload.accountSid}/${payload.taskSid}] Error in patchTaskAttributes: task with sid ${payload.taskSid} does not exist in workspace ${payload.workspaceSid} when trying to ${payload.step} it.`;
  console.error(errorMessage, payload.errorInstance);
  result.message = errorMessage;
  return result;
};

export const patchTaskAttributes = async (
  accountSid: AccountSID,
  taskSid: TaskSID,
  updatedAttributesGenerator: (
    originalTaskAttributes: Record<string, any>,
  ) => Record<string, any>,
  attemptsAlreadyMade = 0,
): Promise<
  Result<
    | ErrorResultPayload
    | MissingTaskErrorResultPayload
    | PreconditionFailedErrorResultPayload,
    undefined
  >
> => {
  // Ensure we have a private Twilio client so the lastRequest check always returns the prior fetch request
  const client = await getTwilioClient(accountSid);
  const workspaceSid: WorkspaceSID = await getWorkspaceSid(accountSid);
  console.info('Patching task', taskSid);

  if (!taskSid) throw new Error('TaskSid missing in event object');

  let task;

  try {
    task = await client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
  } catch (error) {
    const restError = error as RestException;
    if (restError.status === 404) {
      return missingTaskError({
        accountSid,
        taskSid,
        workspaceSid,
        step: 'fetch',
        errorInstance: error as Error,
      });
    } else {
      return newErrorResult({
        accountSid,
        taskSid,
        step: 'fetch',
        errorInstance: error as Error,
      });
    }
  }
  // This is only safely the above fetch request if the client is private to this method
  const { lastResponse } = client.httpClient;
  let version: string | null = null;
  if (!lastResponse) {
    console.warn(
      `[${accountSid}/${taskSid}] patchTaskAttributes: no lastRequest found on httpClient after fetch, optimistic locking will not be applied.`,
    );
  } else {
    version = typeof lastResponse.headers === 'object' ? lastResponse.headers.etag : null;
    if (!version) {
      console.warn(
        `[${accountSid}/${taskSid}] patchTaskAttributes: no etag header found on lastRequest after fetch, optimistic locking will not be applied.`,
      );
    }
  }

  const taskAttributes = JSON.parse(task.attributes);

  const newAttributes = updatedAttributesGenerator(taskAttributes);

  try {
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks(taskSid)
      .update({
        attributes: JSON.stringify(newAttributes),
        ...(version ? { ifMatch: version } : {}),
      });
    return newOk(undefined);
  } catch (error) {
    const restError = error as RestException;
    switch (restError.status) {
      case 412:
        if (attemptsAlreadyMade < MAX_ATTEMPTS) {
          console.warn(
            `Error 412 thrown, this usually indicates a mismatch in the ETag from the fetched task (${version}) and the one being updated, retry attempt ${attemptsAlreadyMade + 1} / ${MAX_ATTEMPTS}`,
          );
          return patchTaskAttributes(
            accountSid,
            taskSid,
            updatedAttributesGenerator,
            attemptsAlreadyMade + 1,
          );
        }
        return newErrorResult({
          accountSid,
          taskSid,
          etag: version,
          step: 'update',
          errorInstance: restError,
        });
      case 404:
        return missingTaskError({
          accountSid,
          taskSid,
          workspaceSid,
          step: 'update',
          errorInstance: restError,
        });
      default:
        return newErrorResult({
          accountSid,
          taskSid,
          step: 'update',
          errorInstance: restError,
        });
    }
  }
};
