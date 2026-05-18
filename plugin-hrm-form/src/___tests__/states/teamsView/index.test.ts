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
import each from 'jest-each';

import {
  reduce,
  newTeamsViewSelectWorkers,
  newTeamsViewUnselectWorkers,
  newTeamsViewSelectSkills,
  newTeamsViewSelectOperation,
  TeamsViewState,
} from '../../../states/teamsView';

describe('test reducer', () => {
  test('empty state with unrelated action - should return initial state', async () => {
    const state = undefined;
    const expected: TeamsViewState = {
      selectedWorkers: new Set(),
      selectedSkills: new Set(),
      status: {
        loading: false,
        error: null,
      },
    };

    const result = reduce(state, {} as any);
    expect(result).toStrictEqual(expected);
  });

  test('existing state with unrelated action - should return same state', async () => {
    const state: TeamsViewState = {
      selectedWorkers: new Set(['WK-123']),
      selectedSkills: new Set<string>(),
      status: {
        loading: false,
        error: null,
      },
    };
    const expected = state;

    const result = reduce(state, {} as any);
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-123']),
        selectedSkills: new Set<string>(),
      },
      description: 'add single worker to blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-123']),
        selectedSkills: new Set<string>(),
      },
      description: 'add single worker to existing state merges them',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-xxx'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      description: 'add single worker already selected does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-123', 'WK-999']),
        selectedSkills: new Set<string>(),
      },
      description: 'add multiple workers to blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-123', 'WK-999']),
        selectedSkills: new Set<string>(),
      },
      description: 'add multiple workers to existing state merges them',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-xxx', 'WK-yyy'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
        selectedSkills: new Set<string>(),
      },
      description: 'add multiple workers already selected does nothing',
    },
  ]).test('TEAMSVIEW_SELECT_WORKERS - $description', async ({ state, workersSids, expected }) => {
    const result = reduce(state, newTeamsViewSelectWorkers(workersSids));
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      description: 'remove single worker to blank state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      description: 'remove missing worker to existing state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-xxx'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      description: 'remove selected worker to existing state results in blank state',
    },
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      description: 'remove multiple workers to blank state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
        selectedSkills: new Set<string>(),
      },
      description: 'remove multiple missing workers to existing state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-xxx', 'WK-yyy'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      description: 'remove all selected workers to existing state results in blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy', 'WK-zzz']),
        selectedSkills: new Set<string>(),
      },
      workersSids: ['WK-xxx', 'WK-zzz'],
      expected: {
        selectedWorkers: new Set(['WK-yyy']),
        selectedSkills: new Set<string>(),
      },
      description: 'remove multiple selected workers to existing state results in partial state',
    },
  ]).test('TEAMSVIEW_UNSELECT_WORKERS - $description', async ({ state, workersSids, expected }) => {
    const result = reduce(state, newTeamsViewUnselectWorkers(workersSids));
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      skills: ['skill-1'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(['skill-1']),
      },
      description: 'set single skill',
    },
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      skills: ['skill-1', 'skill-2'],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(['skill-1', 'skill-2']),
      },
      description: 'set multiple skills',
    },
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      skills: [],
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>([]),
      },
      description: 'set empty skills',
    },
  ]).test('TEAMSVIEW_SELECT_SKILLS - $description', async ({ state, skills, expected }) => {
    const result = reduce(state, newTeamsViewSelectSkills(skills));
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
      },
      operation: 'enable',
      expected: {
        selectedWorkers: new Set(),
        selectedSkills: new Set<string>(),
        operation: 'enable',
      },
      description: 'update operation',
    },
  ]).test('TEAMSVIEW_SELECT_OPERATION - $description', async ({ state, operation, expected }) => {
    const result = reduce(state, newTeamsViewSelectOperation(operation));
    expect(result).toStrictEqual(expected);
  });
});
