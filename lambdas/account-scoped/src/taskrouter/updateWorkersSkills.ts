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
import { isErr, newErr, newOk, Result } from '../Result';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import {
  Twilio,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import {
  retrieveServiceConfigurationTaskRouterSkills,
  TaskRouterSKill,
} from '../configuration/aseloConfiguration';
import { isObject } from 'lodash';

const validOperations = ['enable', 'disable', 'assign', 'unassign'] as const;
type ValidOperations = (typeof validOperations)[number];

const isInteger = (n: any): n is number => Number.isInteger(n);

const rotateRoutingSkills = ({
  from,
  to,
  elements,
}: {
  from: WorkerRoutingSkills;
  to: WorkerRoutingSkills;
  elements: SkillsParam;
}): {
  updatedFrom: WorkerRoutingSkills;
  updatedTo: WorkerRoutingSkills;
} => {
  console.log('rotateRoutingSkills: ', from);
  console.log('rotateRoutingSkills: ', to);
  console.log('rotateRoutingSkills: ', elements);

  const elementsHas = (skill: string) => Object.hasOwn(elements, skill);
  const prevSkills = from.skills || [];
  const prevLevels = Object.entries(from.levels || {});

  // const updatedToSkills = Array.from(new Set([...to.skills, ...Object.keys(elements)]));
  const updatedToSkills = Array.from(
    new Set([...to.skills, ...prevSkills.filter(s => elementsHas(s))]),
  );
  const levelsToRotate = Object.fromEntries(prevLevels.filter(([s]) => elementsHas(s)));
  const updatedToLevels = {
    ...to.levels,
    ...levelsToRotate,
    ...Object.entries(elements).reduce(
      (accum, [s, entry]) =>
        entry && isInteger(entry.level) ? { ...accum, [s]: entry.level } : accum,
      {},
    ),
  };

  const updatedFromSkills = prevSkills.filter(s => !elementsHas(s));
  const updatedFromLevels = Object.fromEntries(
    prevLevels.filter(([s]) => !elementsHas(s)),
  );

  return {
    updatedFrom: { skills: updatedFromSkills, levels: updatedFromLevels },
    updatedTo: { skills: updatedToSkills, levels: updatedToLevels },
  };
};

const mergeAttributes = ({
  attributes,
  enabledSkills,
  disabledSkills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: WorkerRoutingSkills;
  disabledSkills: WorkerRoutingSkills;
}) => {
  return {
    ...attributes,
    routing: enabledSkills,
    disabled_skills: disabledSkills,
  };
};

const setSkillsEnable = ({
  attributes,
  enabledSkills,
  disabledSkills,
  skills,
}: {
  attributes: { [k: string]: any };
  enabledSkills: WorkerRoutingSkills;
  disabledSkills: WorkerRoutingSkills;
  skills: SkillsParam;
}) => {
  const { updatedFrom, updatedTo } = rotateRoutingSkills({
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
  enabledSkills: WorkerRoutingSkills;
  disabledSkills: WorkerRoutingSkills;
  skills: SkillsParam;
}) => {
  const { updatedFrom, updatedTo } = rotateRoutingSkills({
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
  enabledSkills: WorkerRoutingSkills;
  disabledSkills: WorkerRoutingSkills;
  skills: SkillsParam;
}) => {
  const assignedSkills = new Set([...enabledSkills.skills, ...disabledSkills.skills]);

  const entries = Object.entries(skills);
  const updatedEnabledSkills = entries.reduce((accum, [s]) => {
    if (assignedSkills.has(s)) {
      return accum;
    }
    return [...accum, s];
  }, enabledSkills.skills);

  const updatedEnabledSkillsLevels = entries.reduce((accum, [s, entry]) => {
    if (assignedSkills.has(s)) {
      return accum;
    }

    if (!entry || !isInteger(entry.level)) {
      return accum;
    }
    return { ...accum, [s]: entry.level };
  }, enabledSkills.levels);

  return mergeAttributes({
    attributes,
    enabledSkills: { skills: updatedEnabledSkills, levels: updatedEnabledSkillsLevels },
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
  enabledSkills: WorkerRoutingSkills;
  disabledSkills: WorkerRoutingSkills;
  skills: SkillsParam;
}) => {
  const updatedEnabledSkills = enabledSkills.skills.filter(
    s => !Object.hasOwn(skills, s),
  );
  const updatedEnabledSkillsLevels = Object.fromEntries(
    Object.entries(enabledSkills.levels).filter(([s]) => !Object.hasOwn(skills, s)),
  );
  const updatedDisabledSkills = disabledSkills.skills.filter(
    s => !Object.hasOwn(skills, s),
  );
  const updatedDisabledSkillsLevels = Object.fromEntries(
    Object.entries(disabledSkills.levels).filter(([s]) => !Object.hasOwn(skills, s)),
  );

  return mergeAttributes({
    attributes,
    enabledSkills: { skills: updatedEnabledSkills, levels: updatedEnabledSkillsLevels },
    disabledSkills: {
      skills: updatedDisabledSkills,
      levels: updatedDisabledSkillsLevels,
    },
  });
};

const updateSkillsOperation = ({
  attributes,
  operation,
  skills,
}: {
  attributes: { [k: string]: any };
  skills: SkillsParam;
  operation: ValidOperations;
}) => {
  const enabledSkills: WorkerRoutingSkills = attributes?.routing || {
    skills: [],
    levels: {},
  };
  const disabledSkills: WorkerRoutingSkills = attributes?.disabled_skills || {
    skills: [],
    levels: {},
  };
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
  skills: SkillsParam;
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

    console.log('>>>>> workerAttributes', workerAttributes);
    console.log('>>>>> updatedAttributes', updatedAttributes);
    await worker.update({ attributes: JSON.stringify(updatedAttributes) });

    return newOk(workerSid);
  } catch (err) {
    console.error(err);
    return newErr({
      error: err,
      message: 'Failed to update worker skills',
      extraProperties: { workerSid },
    });
  }
};

const validateSkills = async ({
  client,
  skills,
  operation,
}: {
  client: Twilio;
  skills: Partial<SkillsParam>;
  operation: ValidOperations;
}): Promise<Result<'InvalidSkill' | 'InvalidLevel', undefined>[]> => {
  const taskrouterSkills = (
    await retrieveServiceConfigurationTaskRouterSkills(client)
  ).reduce<Record<string, TaskRouterSKill>>(
    (accum, curr) => ({ ...accum, [curr.name]: curr }),
    {} as any,
  );

  const results = Object.entries(skills).map(([name, entry]) => {
    const trs = taskrouterSkills[name];
    // validate that the skill exists
    if (!trs) {
      return newErr({
        error: 'InvalidSkill' as const,
        message: `${name} skill does not exists`,
      });
    }

    if (operation === 'unassign' || operation === 'disable') {
      return newOk(undefined);
    }

    // validate skills that require a level
    if (trs.multivalue) {
      const { level } = entry || {};
      if (!isInteger(level)) {
        return newErr({
          error: 'InvalidLevel' as const,
          message: `${name} level is not an integer`,
        });
      }

      if (level < trs.minimum || level > trs.maximum) {
        return newErr({
          error: 'InvalidLevel' as const,
          message: `${name} level is not within the valid range`,
        });
      }
    }

    return newOk(undefined);
  });

  return results;
};

type SkillsParam = { [name: string]: { level: number | null } };
type WorkerRoutingSkills = { skills: string[]; levels: Record<string, number> };
export const handleUpdateWorkersSkills: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  try {
    const { workers, skills, operation } = body;

    if (!workers || !Array.isArray(workers)) return newMissingParameterResult('workers');
    if (!skills || !isObject(skills)) return newMissingParameterResult('skills');
    if (!operation || !validOperations.includes(operation))
      return newMissingParameterResult('operation');

    const client = await getTwilioClient(accountSid);

    const validateSkillsResults = await validateSkills({ client, skills, operation });
    const errors = validateSkillsResults
      .filter(r => isErr(r))
      .map(e => `${e.error}: ${e.message}`);
    if (errors.length) {
      return newHttpErrorResult('InvalidSkills', 400, errors.join('\n'));
    }

    const workspaceSid = await getWorkspaceSid(accountSid);

    const result = await Promise.all(
      workers.map(workerSid =>
        updateWorkerSkills({
          operation,
          skills: skills as SkillsParam,
          workerSid,
          workspaceSid,
          client,
        }),
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
