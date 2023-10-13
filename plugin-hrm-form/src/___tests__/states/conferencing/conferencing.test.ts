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
import { pipe } from 'lodash/fp';
import { DefinitionVersion, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import {
  reduce,
  setIsDialogOpenAction,
  setCallStatusAction,
  setPhoneNumberAction,
  ConferencingState,
  newTaskEntry,
} from '../../../states/conferencing';
import { initializeContactState, recreateContactState, removeContactState } from '../../../states/actions';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, buildBaseURL } = useFetchDefinitions();

let mockV1: DefinitionVersion;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
});

describe('reduce', () => {
  test('when initializeContactState is called on empty state, initializes taskId with newTaskEntry', async () => {
    const result = reduce(
      undefined,
      initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );

    const expected: ConferencingState = { tasks: { WT12345: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  test('when initializeContactState is called on existing state, initializes taskId with newTaskEntry', async () => {
    const initialized = reduce(
      undefined,
      initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );
    const result = reduce(
      initialized,
      initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT99999' }, VALID_EMPTY_METADATA),
    );

    const expected: ConferencingState = { tasks: { WT12345: newTaskEntry, WT99999: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  test('when recreateContactState is called on empty state, initializes taskId with newTaskEntry', async () => {
    const result = reduce(
      undefined,
      recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );

    const expected: ConferencingState = { tasks: { WT12345: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  test('when recreateContactState is called on existing state, initializes taskId with newTaskEntry', async () => {
    const initialized = reduce(
      undefined,
      recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );
    const result = reduce(
      initialized,
      recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT99999' }, VALID_EMPTY_METADATA),
    );

    const expected: ConferencingState = { tasks: { WT12345: newTaskEntry, WT99999: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  test('when recreateContactState is called with taskId found in the state, removes it', async () => {
    const initialized = pipe(
      () =>
        reduce(
          undefined,
          recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
        ),
      state =>
        reduce(
          state,
          recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT99999' }, VALID_EMPTY_METADATA),
        ),
    )();

    const result = reduce(initialized, removeContactState('WT12345', ''));

    const expected: ConferencingState = { tasks: { WT99999: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  test('when recreateContactState is called with taskId not found in the state, leave state untouched', async () => {
    const initialized = pipe(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () =>
        reduce(
          undefined,
          recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
        ),
      // eslint-disable-next-line sonarjs/no-identical-functions
      state =>
        reduce(
          state,
          recreateContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT99999' }, VALID_EMPTY_METADATA),
        ),
    )();

    const result = reduce(initialized, removeContactState('WT00000', ''));

    const expected: ConferencingState = { tasks: { WT12345: newTaskEntry, WT99999: newTaskEntry } };

    expect(result).toMatchObject(expected);
  });

  each([{ value: true }, { value: false }]).test(
    'when setIsDialogOpenAction is called with $value, set isDialogOpen to $value',
    async ({ value }) => {
      const initializedState = reduce(
        undefined,
        initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
      );

      const result = reduce(initializedState, setIsDialogOpenAction('WT12345', value));

      const expected: ConferencingState = { tasks: { WT12345: { ...newTaskEntry, isDialogOpen: value } } };

      expect(result).toMatchObject(expected);
    },
  );

  each([
    { value: 'no-call' },
    { value: 'initiating' },
    { value: 'initiated' },
    { value: 'ringing' },
    { value: 'busy' },
    { value: 'failed' },
    { value: 'in-progress' },
    { value: 'completed' },
  ]).test('when setCallStatusAction is called with $value, set isLoading to $value', async ({ value }) => {
    const initializedState = reduce(
      undefined,
      initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );

    const result = reduce(initializedState, setCallStatusAction('WT12345', value));

    const expected: ConferencingState = { tasks: { WT12345: { ...newTaskEntry, callStatus: value } } };

    expect(result).toMatchObject(expected);
  });

  test('when setPhoneNumberAction is called, set phoneNumber', async () => {
    const initializedState = reduce(
      undefined,
      initializeContactState(mockV1)({ ...VALID_EMPTY_CONTACT, taskId: 'WT12345' }, VALID_EMPTY_METADATA),
    );

    const result = reduce(initializedState, setPhoneNumberAction('WT12345', '+1234567890'));

    const expected: ConferencingState = { tasks: { WT12345: { ...newTaskEntry, phoneNumber: '+1234567890' } } };

    expect(result).toMatchObject(expected);
  });

  // test('when');
});
