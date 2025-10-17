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
import { newErr, newOk } from '../Result';
import { newMissingParameterResult } from '../httpErrors';
import {
  getTwilioClient,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';

const validOperations = ['enable', 'disable'] as const;
type ValidOperations = (typeof validOperations)[number];

const updateSkillsOperation = ({
  attributes,
  operation,
  skills,
}: {
  attributes: any;
  skills: Array<string>;
  operation: ValidOperations;
}) => {
  if (operation === 'enable') {
    if (!attributes?.routing?.skills) {
      return attributes;
    }

    const updatedSkills = Array.from(new Set([...attributes.routing.skills, ...skills]));

    return {
      ...attributes,
      routing: {
        ...attributes.routing,
        skills: updatedSkills,
      },
    };
  }

  if (operation === 'disable') {
    if (!attributes?.disabled_skills?.skills) {
      return attributes;
    }

    const updatedSkills = (attributes.disabled_skills.skills as string[]).filter(
      s => !skills.includes(s),
    );

    return {
      ...attributes,
      disabled_skills: {
        ...attributes.disabled_skills,
        skills: updatedSkills,
      },
    };
  }
};

const updateWorkerSkills = async ({
  client,
  skills,
  operation,
  workerSid,
  workspaceSid,
}: {
  workerSid: string;
  workspaceSid: string;
  skills: string[];
  operation: ValidOperations;
  client: Awaited<ReturnType<typeof getTwilioClient>>;
}) => {
  try {
    const worker = await client.taskrouter.v1
      .workspaces(workspaceSid)
      .workers(workerSid)
      .fetch();

    const workerAttributes = JSON.parse(worker.attributes);
    const updatedAttributes = updateSkillsOperation({
      attributes: workerAttributes,
      skills,
      operation,
    });

    await worker.update({ attributes: JSON.stringify(updatedAttributes) });

    return newOk(workerSid);
  } catch (err) {
    return newErr({
      error: err,
      message: 'Failed to update worker skills',
      extraProperties: { workerSid },
    });
  }
};

export const updateWorkersSkills: AccountScopedHandler = async ({ body }, accountSid) => {
  const { workers, skills, operation } = body;

  if (!workers || !Array.isArray(workers)) return newMissingParameterResult('workers');
  if (!skills || !Array.isArray(skills)) return newMissingParameterResult('skills');
  if (!operation || !validOperations.includes(operation))
    return newMissingParameterResult('operation');

  const workspaceSid = await getTwilioWorkspaceSid(accountSid);

  const client = await getTwilioClient(accountSid);

  const result = await Promise.all(
    workers.map(workerSid =>
      updateWorkerSkills({ operation, skills, workerSid, workspaceSid, client }),
    ),
  );

  console.debug(`Skills ${skills} ${operation} for workers ${workers}`);

  return newOk({
    message: `Skills ${skills} ${operation} for workers ${workers}`,
    result,
  });
};
