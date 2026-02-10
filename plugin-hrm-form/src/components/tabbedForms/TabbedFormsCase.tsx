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
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { recordBackendError } from '../../fullStory';
import { completeTask } from '../../services/formSubmissionHelpers';
import { RootState } from '../../states';
import { ContactMetadata } from '../../states/contacts/types';
import { submitContactFormAsyncAction } from '../../states/contacts/saveContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { newCloseModalAction } from '../../states/routing/actions';
import { CaseLayout } from '../case/styles';
import { Contact, CustomITask } from '../../types/types';
import Case from '../case/Case';
import { useTabbedFormContext } from './hooks/useTabbedForm';
import { TabbedFormsCommonProps } from './types';
import { getTemplateStrings } from '../../hrmConfig';
import { CaseStateEntry } from '../../states/case/types';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import TabbedFormsTabs from './TabbedFormsTabs';

type Props = TabbedFormsCommonProps;

const TabbedFormsCase: React.FC<Props> = props => {
  const { task } = props;
  const dispatch = useDispatch();
  const { metadata, savedContact } = useSelector((state: RootState) => selectContactByTaskSid(state, task.taskSid));
  const caseState = useSelector((state: RootState) => selectCaseByCaseId(state, savedContact?.caseId));
  const strings = getTemplateStrings();
  const { newSubmitHandler } = useTabbedFormContext();

  const closeModal = () => dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms'));

  const finaliseContact = (contact: Contact, metadata: ContactMetadata, caseState: CaseStateEntry) =>
    dispatch(submitContactFormAsyncAction(task as CustomITask, contact, metadata, caseState));

  const submit = async () => {
    try {
      await finaliseContact(savedContact, metadata, caseState);
      await completeTask(task, savedContact);
    } catch (error) {
      if (window.confirm(strings['Error-ContinueWithoutRecording'])) {
        recordBackendError('Submit Contact Form TASK COMPLETED WITHOUT RECORDING', error);
        await completeTask(task, savedContact);
      } else {
        recordBackendError('Submit Contact Form', error);
      }
    }
    return undefined;
  };
  const onNewCaseSaved = async () => {
    await newSubmitHandler(() => submit())();
  };

  return (
    <CaseLayout>
      <Case task={task} onNewCaseSaved={onNewCaseSaved} handleClose={closeModal} />
      <div style={{ display: 'none' }}>
        {
          // Hack in order for RHF to validate the complete form on a save from the case form.
        }
        <TabbedFormsTabs {...props} />
      </div>
    </CaseLayout>
  );
};

TabbedFormsCase.displayName = 'TabbedFormsCase';

export default TabbedFormsCase;
