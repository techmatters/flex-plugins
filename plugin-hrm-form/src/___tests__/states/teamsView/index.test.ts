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
  TEAMSVIEW_SELECT_WORKERS,
  TEAMSVIEW_UNSELECT_WORKERS,
  teamsViewSelectWorkers,
  teamsViewUnselectWorkers,
} from '../../../states/teamsView';

describe('test action creators', () => {
  each([
    {
      workerSids: ['WK-123'],
      description: 'single worker',
    },
    {
      workerSids: ['WK-123', 'WK-999'],
      description: 'multiple workers',
    },
  ]).test('teamsViewSelectWorkers - $description', async ({ workerSids }) => {
    expect(teamsViewSelectWorkers(workerSids)).toStrictEqual({
      type: TEAMSVIEW_SELECT_WORKERS,
      payload: workerSids,
    });
  });

  each([
    {
      workerSids: ['WK-123'],
      description: 'single worker',
    },
    {
      workerSids: ['WK-123', 'WK-999'],
      description: 'multiple workers',
    },
  ]).test('teamsViewUnselectWorkers - $description', async ({ workerSids }) => {
    expect(teamsViewUnselectWorkers(workerSids)).toStrictEqual({
      type: TEAMSVIEW_UNSELECT_WORKERS,
      payload: workerSids,
    });
  });
});

describe('test reducer', () => {
  test('empty state with unrelated action - should return initial state', async () => {
    const state = undefined;
    const expected = {
      selectedWorkers: new Set(),
    };

    const result = reduce(state, {} as any);
    expect(result).toStrictEqual(expected);
  });

  test('existing state with unrelated action - should return same state', async () => {
    const state = {
      selectedWorkers: new Set(['WK-123']),
    };
    const expected = state;

    const result = reduce(state, {} as any);
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-123']),
      },
      description: 'add single worker to blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-123']),
      },
      description: 'add single worker to existing state merges them',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-xxx'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      description: 'add single worker already selected does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-123', 'WK-999']),
      },
      description: 'add multiple workers to blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-123', 'WK-999']),
      },
      description: 'add multiple workers to existing state merges them',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
      },
      workersSids: ['WK-xxx', 'WK-yyy'],
      expected: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
      },
      description: 'add multiple workers already selected does nothing',
    },
  ]).test('TEAMSVIEW_SELECT_WORKERS - $description', async ({ state, workersSids, expected }) => {
    const result = reduce(state, teamsViewSelectWorkers(workersSids));
    expect(result).toStrictEqual(expected);
  });

  each([
    {
      state: {
        selectedWorkers: new Set(),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(),
      },
      description: 'remove single worker to blank state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-123'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      description: 'remove missing worker to existing state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-xxx'],
      expected: {
        selectedWorkers: new Set(),
      },
      description: 'remove selected worker to existing state results in blank state',
    },
    {
      state: {
        selectedWorkers: new Set(),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(),
      },
      description: 'remove multiple workers to blank state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      workersSids: ['WK-123', 'WK-999'],
      expected: {
        selectedWorkers: new Set(['WK-xxx']),
      },
      description: 'remove multiple missing workers to existing state does nothing',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy']),
      },
      workersSids: ['WK-xxx', 'WK-yyy'],
      expected: {
        selectedWorkers: new Set(),
      },
      description: 'remove all selected workers to existing state results in blank state',
    },
    {
      state: {
        selectedWorkers: new Set(['WK-xxx', 'WK-yyy', 'WK-zzz']),
      },
      workersSids: ['WK-xxx', 'WK-zzz'],
      expected: {
        selectedWorkers: new Set(['WK-yyy']),
      },
      description: 'remove multiple selected workers to existing state results in partial state',
    },
  ]).test('TEAMSVIEW_UNSELECT_WORKERS - $description', async ({ state, workersSids, expected }) => {
    const result = reduce(state, teamsViewUnselectWorkers(workersSids));
    expect(result).toStrictEqual(expected);
  });
});
