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
} from '@tech-matters/twilio-configuration';

const validOperations = ['enable', 'disable', 'assign', 'unassign'] as const;
type ValidOperations = (typeof validOperations)[number];

const moveElementsBetweenArrays = ({
  from,
  to,
  elements,
}: {
  from: string[];
  to: string[];
  elements: string[];
}) => {
  const updatedFrom = from.filter(e => !elements.includes(e));
  const updatedTo = Array.from(new Set([...to, ...elements]));

  return { updatedFrom, updatedTo };
};

const mergeAttributes = ({
  attributes,
  enabledSkills,
  disabledSkills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: string[];
  disabledSkills: string[];
}) => {
  return {
    ...attributes,
    routing: {
      ...attributes?.routing,
      skills: enabledSkills,
    },
    disabled_skills: {
      ...attributes.disabled_skills,
      skills: disabledSkills,
    },
  };
};

const setSkillsEnable = ({
  attributes,
  enabledSkills,
  disabledSkills,
  skills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: string[];
  disabledSkills: string[];
  skills: string[];
}) => {
  const { updatedFrom, updatedTo } = moveElementsBetweenArrays({
    from: disabledSkills,
    to: enabledSkills,
    elements: skills,
  });

  return mergeAttributes({
    attributes,
    enabledSkills: updatedTo,
    disabledSkills: updatedFrom,
  });
};

const setSkillsDisable = ({
  attributes,
  enabledSkills,
  disabledSkills,
  skills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: string[];
  disabledSkills: string[];
  skills: string[];
}) => {
  const { updatedFrom, updatedTo } = moveElementsBetweenArrays({
    from: enabledSkills,
    to: disabledSkills,
    elements: skills,
  });

  return mergeAttributes({
    attributes,
    enabledSkills: updatedFrom,
    disabledSkills: updatedTo,
  });
};

const setSkillsAssign = ({
  attributes,
  enabledSkills,
  disabledSkills,
  skills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: string[];
  disabledSkills: string[];
  skills: string[];
}) => {
  const assignedSkills = new Set([...enabledSkills, ...disabledSkills]);

  const updatedEnabledSkills = skills.reduce((accum, skill) => {
    if (assignedSkills.has(skill)) {
      return accum;
    }

    return [...accum, skill];
  }, enabledSkills);

  return mergeAttributes({
    attributes,
    enabledSkills: updatedEnabledSkills,
    disabledSkills,
  });
};

const setSkillsUnassign = ({
  attributes,
  enabledSkills,
  disabledSkills,
  skills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: string[];
  disabledSkills: string[];
  skills: string[];
}) => {
  const updatedEnabledSkills = enabledSkills.filter(s => !skills.includes(s));
  const updatedDisabledSkills = disabledSkills.filter(s => !skills.includes(s));

  return mergeAttributes({
    attributes,
    enabledSkills: updatedEnabledSkills,
    disabledSkills: updatedDisabledSkills,
  });
};

const updateSkillsOperation = ({
  attributes,
  operation,
  skills,
}: {
  attributes: { [k: string]: any };
  skills: string[];
  operation: ValidOperations;
}) => {
  const enabledSkills = attributes?.routing?.skills || [];
  const disabledSkills = attributes?.disabled_skills?.skills || [];
  const params = {
    attributes,
    enabledSkills,
    disabledSkills,
    skills,
  };

  switch (operation) {
    case 'enable': {
      return setSkillsEnable(params);
    }
    case 'disable': {
      return setSkillsDisable(params);
    }
    case 'assign': {
      return setSkillsAssign(params);
    }
    case 'unassign': {
      return setSkillsUnassign(params);
    }
    default:
      return attributes;
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

export const handleUpdateWorkersSkills: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  try {
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
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
