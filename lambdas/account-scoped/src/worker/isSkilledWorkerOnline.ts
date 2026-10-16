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

import { AccountScopedHandler } from '../httpTypes';
import { newOk } from '@tech-matters/result-type';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { hasRequiredSkills } from './isSkilledWorkerAvailable';

type WorkerAttributes = {
  routing?: {
    skills?: string[];
  };
};

// Flex default activity for workers who are logged out. Always excluded.
const OFFLINE_ACTIVITY_NAME = 'Offline';

/**
 * Parses a comma-separated list, trimming whitespace and dropping empty entries.
 */
const parseList = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

/**
 * Counts workers with the requested skills who are logged in, i.e. in any
 * activity other than 'Offline' (Available, Break, Unavailable, etc.),
 * regardless of how many tasks they are currently handling.
 *
 * Optional excludedActivities (comma-separated, case-insensitive) lets a Studio
 * flow exclude more activities on top of 'Offline', e.g. "Break,Unavailable".
 *
 * Unlike isSkilledWorkerAvailable, this does not check worker channel capacity,
 * so a worker on a call, at max chat capacity or on a break is still counted.
 * Use it to answer "is anyone with these skills logged in?" rather than
 * "can someone take this contact right now?".
 */
export const isSkilledWorkerOnlineHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { targetSkills, excludedActivities } = body as {
    targetSkills?: string;
    excludedActivities?: string;
  };

  if (!targetSkills) {
    return newMissingParameterResult('targetSkills');
  }

  //We get the required skills as a comma-separated list
  const requiredSkills = parseList(targetSkills);

  if (requiredSkills.length === 0) {
    return newHttpErrorResult(
      `No valid target skills were supplied. Expected a comma-separated list, e.g. "Spanish,Chat".`,
      400,
    );
  }

  //Offline is always excluded; the flow can add more activities to exclude
  const excludedActivityNames = [
    OFFLINE_ACTIVITY_NAME,
    ...parseList(excludedActivities ?? ''),
  ].map(activity => activity.toLowerCase());

  console.info('Checking online workers', {
    accountSid,
    requiredSkills,
    excludedActivityNames,
  });

  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  /**
   * Retrieve every worker in the workspace.
   * TaskRouter can't filter on "activity is not X", so excluded activities
   * are filtered out below instead of in the query.
   */
  const allWorkers = await client.taskrouter.v1.workspaces(workspaceSid).workers.list();

  const onlineWorkerSids = allWorkers
    .filter(worker => {
      if (excludedActivityNames.includes((worker.activityName ?? '').toLowerCase())) {
        return false;
      }
      const attributes = JSON.parse(worker.attributes) as WorkerAttributes;
      return hasRequiredSkills(attributes.routing?.skills ?? [], requiredSkills);
    })
    .map(worker => worker.sid);

  console.info('Online check completed', {
    accountSid,
    requiredSkills,
    excludedActivityNames,
    totalOnlineWorkers: onlineWorkerSids.length,
    onlineWorkerSids,
  });

  return newOk({
    totalOnlineWorkers: onlineWorkerSids.length,
    onlineWorkerSids,
  });
};
