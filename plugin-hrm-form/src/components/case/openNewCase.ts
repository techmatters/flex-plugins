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

import { Contact, RouterTask } from '../../types/types';
import { recordBackendError } from '../../fullStory';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { hasTaskControl } from '../../transfer/transferTaskState';
import asyncDispatch from '../../states/asyncDispatch';
import { createCaseAsyncAction } from '../../states/case/saveCase';
import { newOpenModalAction } from '../../states/routing/actions';

const openNewCase = async (task: RouterTask, savedContact: Contact, contact: Contact, dispatch) => {
  const strings = getTemplateStrings();
  const { workerSid, definitionVersion } = getHrmConfig();

  if (!hasTaskControl(task)) return;

  try {
    // Deliberately using dispatch rather than asyncDispatch here, because we still handle the error from where the action is dispatched.
    // TODO: Rework error handling to be based on redux state set by the _REJECTED action
    await asyncDispatch(dispatch)(createCaseAsyncAction(contact, workerSid, definitionVersion));
    dispatch(
      newOpenModalAction(
        {
          contextContactId: savedContact.id,
          route: 'case',
          subroute: 'home',
          isCreating: true,
          caseId: undefined,
        },
        task.taskSid,
      ),
    );
  } catch (error) {
    recordBackendError('Open New Case', error);
    window.alert(strings['Error-Backend']);
  }
};

export default openNewCase;
