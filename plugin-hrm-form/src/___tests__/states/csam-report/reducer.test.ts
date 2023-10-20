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

import { reduce, initialState } from '../../../states/csam-report/reducer';
import * as actions from '../../../states/csam-report/actions';
import { ChildCSAMReportForm, CSAMReportActionType, CSAMReportTypes } from '../../../states/csam-report/types';
import { initialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
import {
  newCSAMReportActionForContact,
  updateCounsellorFormActionForContact,
} from '../../../states/csam-report/actions';

const childForm: ChildCSAMReportForm = {
  ageVerified: false,
  childAge: '16',
};
const newCounsellorTaskEntry = {
  form: { ...initialValues },
  reportType: CSAMReportTypes.COUNSELLOR,
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
} as const;
const task = { taskSid: 'task-sid' };
const testContactId = 'TEST_CONTACT_ID';

describe('test reducer', () => {
  test('should return initial state', async () => {
    const state = undefined;

    const expected = initialState;

    const result = reduce(state, <CSAMReportActionType>{});
    expect(result).toStrictEqual(expected);
  });
  describe('UPDATE_FORM', () => {
    describe('for contact', () => {
      test('contact exists - should replace form for entry at contactId', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.CHILD,
              form: { ...childForm, ageVerified: true },
            },
          },
        };

        const result = reduce(
          state,
          actions.updateChildFormActionForContact({ ...childForm, ageVerified: true }, testContactId),
        );

        expect(result).toStrictEqual(expected);
      });
      test("contact doesn't exist - creates CSAM entry with just form", async () => {
        const result = reduce(
          initialState,
          actions.updateCounsellorFormActionForContact(
            { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            testContactId,
          ),
        );

        expect(result).toStrictEqual({
          ...initialState,
          contacts: {
            ...initialState.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            },
          },
        });
      });
      test('contact exists with different form type - should reset type to new form type', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: {
              reportType: CSAMReportTypes.COUNSELLOR,
              form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            },
          },
        };

        const result = reduce(
          state,
          actions.updateCounsellorFormActionForContact(
            { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
            testContactId,
          ),
        );

        expect(result).toStrictEqual(expected);
      });
    });
  });
  describe('UPDATE_STATUS', () => {
    describe('for contact', () => {
      test('contact exists - should set status to one provided in action', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));

        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...state,
          contacts: {
            ...state.contacts,
            [testContactId]: { reportType: CSAMReportTypes.CHILD, reportStatus, form: undefined },
          },
        };

        const result = reduce(state, actions.updateStatusActionForContact(reportStatus, testContactId));

        expect(result).toStrictEqual(expected);
      });

      test("task doesn't exist - create task status to one provided in action", async () => {
        const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
        const expected = {
          ...initialState,
          contacts: {
            ...initialState.contacts,
            [testContactId]: { reportStatus },
          },
        };

        const result = reduce(initialState, actions.updateStatusActionForContact(reportStatus, testContactId));

        expect(result).toStrictEqual(expected);
      });
    });
  });
  describe('REMOVE_DRAFT_CSAM_REPORT', () => {
    describe('for contact', () => {
      test('entry exists for contact ID - it should be removed', async () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR));
        const result = reduce(state, actions.removeCSAMReportActionForContact(testContactId));

        expect(result).toStrictEqual(initialState);
      });
      test('no entry exists for contact ID - NOOP', async () => {
        const result = reduce(initialState, actions.removeCSAMReportActionForContact(testContactId));

        expect(result).toStrictEqual(initialState);
      });
    });
  });
  describe('NEW_DRAFT_CSAM_REPORT', () => {
    describe('for contact', () => {
      const populatedState = reduce(
        initialState,
        updateCounsellorFormActionForContact(
          {
            anonymous: '',
            description: '',
            email: '',
            firstName: '',
            lastName: '',
            webAddress: '',
          },
          testContactId,
        ),
      );
      test('Entry for contact does not exist, createForm option true - adds new task with empty form', () => {
        const state = reduce(
          initialState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, true),
        );
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: {} },
          },
        });
      });

      test('Entry for contact does not exist, createForm option false - adds new task with no form', () => {
        const state = reduce(
          initialState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, false),
        );
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: undefined },
          },
        });
      });

      test('Entry for contact does not exist, createForm option false and no type set - adds empty entry', () => {
        const state = reduce(initialState, newCSAMReportActionForContact(testContactId));
        expect(state).toStrictEqual({
          ...initialState,
          contacts: {
            [testContactId]: { reportType: undefined, form: undefined },
          },
        });
      });

      test('Entry for contact does exist, createForm option true - clears form', () => {
        const state = reduce(
          populatedState,
          newCSAMReportActionForContact(testContactId, CSAMReportTypes.COUNSELLOR, true),
        );
        expect(state).toStrictEqual({
          ...populatedState,
          contacts: {
            [testContactId]: { reportType: CSAMReportTypes.COUNSELLOR, form: {} },
          },
        });
      });

      test('Entry for contact does exist, createForm option false & reportType not set - NOOP', () => {
        const state = reduce(populatedState, newCSAMReportActionForContact(testContactId));
        expect(state).toStrictEqual(populatedState);
      });

      test('Entry for contact does exist, createForm option false and type set - resets type of existing entry', () => {
        const state = reduce(populatedState, newCSAMReportActionForContact(testContactId, CSAMReportTypes.CHILD));
        expect(state).toStrictEqual({
          ...populatedState,
          contacts: {
            [testContactId]: { ...populatedState.contacts[testContactId], reportType: CSAMReportTypes.CHILD },
          },
        });
      });
    });
  });
});
