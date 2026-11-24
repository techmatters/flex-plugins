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

import { AccountSID, WorkerSID, WorkspaceSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import type RestException from 'twilio/lib/base/RestException';
import { ErrorResult, newErr, newOk, Result } from '@tech-matters/result-type';

const MAX_ATTEMPTS = 10;

type PatchWorkerOptions = {
  attemptsAlreadyMade?: number;
  requireEtag?: boolean;
};

/**
 * The subset of worker properties (besides attributes) that this helper is willing to patch.
 * Extend this as needed, rather than exposing the whole update() payload.
 */
export type WorkerPatch = {
  activitySid?: string;
  attributes?: Record<string, any>;
  rejectPendingReservations?: boolean;
};

type ErrorResultPayload = {
  accountSid: AccountSID;
  workerSid: WorkerSID;
  errorInstance: Error;
  step: 'fetch' | 'update';
};

type MissingWorkerErrorResultPayload = ErrorResultPayload & {
  workspaceSid: WorkspaceSID;
};

type PreconditionFailedErrorResultPayload = ErrorResultPayload & {
  etag: string | null;
  step: 'update';
};

export type PatchWorkerSuccessPayload = {
  // The worker's activity / attributes before this patch was applied, in case the caller needs
  // to restore them later.
  previousActivitySid: string;
  previousAttributes: Record<string, any>;
};

const newErrorResult = <
  T extends
    | ErrorResultPayload
    | MissingWorkerErrorResultPayload
    | PreconditionFailedErrorResultPayload,
>(
  payload: T,
): ErrorResult<T> => {
  const errorMessage = `[${payload.accountSid}/${payload.workerSid}] Error in patchWorker when trying to ${payload.step} it.`;
  return newErr({
    message: errorMessage,
    error: payload,
  });
};

const missingWorkerError = (
  payload: MissingWorkerErrorResultPayload,
): ErrorResult<MissingWorkerErrorResultPayload> => {
  const result = newErrorResult<MissingWorkerErrorResultPayload>(payload);
  const errorMessage = `[${payload.accountSid}/${payload.workerSid}] Error in patchWorker: worker with sid ${payload.workerSid} does not exist in workspace ${payload.workspaceSid} when trying to ${payload.step} it.`;
  console.error(errorMessage, payload.errorInstance);
  result.message = errorMessage;
  return result;
};

/**
 * Equivalent of patchTaskAttributes for safely transitioning a worker's activity and/or
 * attributes, using the same optimistic concurrency (ETag / If-Match) protection. Unlike
 * patchTaskAttributes, the generator can also update other worker properties (currently
 * activitySid and rejectPendingReservations) alongside the attributes, since that's needed to
 * move a worker in and out of an available activity.
 *
 * patchGenerator is invoked with the worker's current activitySid & attributes (refetched on
 * every retry, so it always sees the latest state) and should return the subset of properties to
 * patch. Returning undefined for a property leaves it unchanged.
 */
export const patchWorker = async (
  accountSid: AccountSID,
  workerSid: WorkerSID,
  patchGenerator: (original: {
    activitySid: string;
    attributes: Record<string, any>;
  }) => WorkerPatch,
  { attemptsAlreadyMade = 0, requireEtag = false }: PatchWorkerOptions = {},
): Promise<
  Result<
    | ErrorResultPayload
    | MissingWorkerErrorResultPayload
    | PreconditionFailedErrorResultPayload,
    PatchWorkerSuccessPayload
  >
> => {
  // Ensure we have a private Twilio client so the lastRequest check always returns the prior fetch request
  const client = await getTwilioClient(accountSid);
  const workspaceSid: WorkspaceSID = await getWorkspaceSid(accountSid);
  console.info('Patching worker', workerSid);

  if (!workerSid) throw new Error('WorkerSid missing in event object');

  let worker;

  try {
    worker = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workers(workerSid)
      .fetch();
  } catch (error) {
    const restError = error as RestException;
    if (restError.status === 404) {
      return missingWorkerError({
        accountSid,
        workerSid,
        workspaceSid,
        step: 'fetch',
        errorInstance: error as Error,
      });
    } else {
      return newErrorResult({
        accountSid,
        workerSid,
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
      `[${accountSid}/${workerSid}] patchWorker: no lastRequest found on httpClient after fetch, optimistic locking will not be applied.`,
    );
  } else {
    version = typeof lastResponse.headers === 'object' ? lastResponse.headers.etag : null;
    if (!version) {
      console.warn(
        `[${accountSid}/${workerSid}] patchWorker: no etag header found on lastRequest after fetch, optimistic locking will not be applied.`,
      );
    }
  }

  if (requireEtag && !version) {
    return newErrorResult({
      accountSid,
      workerSid,
      etag: version,
      step: 'update',
      errorInstance: new Error('Worker update requires an ETag for optimistic locking'),
    });
  }

  const previousActivitySid = worker.activitySid;
  const previousAttributes = JSON.parse(worker.attributes);

  const patch = patchGenerator({
    activitySid: previousActivitySid,
    attributes: previousAttributes,
  });

  try {
    await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workers(workerSid)
      .update({
        ...(patch.activitySid !== undefined ? { activitySid: patch.activitySid } : {}),
        ...(patch.attributes !== undefined
          ? { attributes: JSON.stringify(patch.attributes) }
          : {}),
        ...(patch.rejectPendingReservations !== undefined
          ? { rejectPendingReservations: patch.rejectPendingReservations }
          : {}),
        ...(version ? { ifMatch: version } : {}),
      });
    return newOk({ previousActivitySid, previousAttributes });
  } catch (error) {
    const restError = error as RestException;
    switch (restError.status) {
      case 412:
        if (attemptsAlreadyMade < MAX_ATTEMPTS) {
          console.warn(
            `Error 412 thrown, this usually indicates a mismatch in the ETag from the fetched worker (${version}) and the one being updated, retry attempt ${attemptsAlreadyMade + 1} / ${MAX_ATTEMPTS}`,
          );
          return patchWorker(accountSid, workerSid, patchGenerator, {
            attemptsAlreadyMade: attemptsAlreadyMade + 1,
            requireEtag,
          });
        }
        return newErrorResult({
          accountSid,
          workerSid,
          etag: version,
          step: 'update',
          errorInstance: restError,
        });
      case 404:
        return missingWorkerError({
          accountSid,
          workerSid,
          workspaceSid,
          step: 'update',
          errorInstance: restError,
        });
      default:
        return newErrorResult({
          accountSid,
          workerSid,
          step: 'update',
          errorInstance: restError,
        });
    }
  }
};
