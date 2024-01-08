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
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { recordBackendError } from '../../fullStory';
import { completeTask } from '../../services/formSubmissionHelpers';
import { RootState } from '../../states';
import { ContactMetadata } from '../../states/contacts/types';
import { submitContactFormAsyncAction } from '../../states/contacts/saveContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { newCloseModalAction } from '../../states/routing/actions';
import { CaseLayout } from '../case/styles';
import { Case as CaseForm, Contact, CustomITask } from '../../types/types';
import Case from '../case/Case';
import useTabbedForm from './hooks/useTabbedForm';
import { TabbedFormsCommonProps } from './types';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const { metadata, savedContact } = selectContactByTaskSid(state, taskSid);

  return {
    metadata,
    savedContact,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => ({
  finaliseContact: (contact: Contact, metadata: ContactMetadata, caseForm: CaseForm) =>
    dispatch(submitContactFormAsyncAction(task as CustomITask, contact, metadata, caseForm)),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms')),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormsCase: React.FC<Props> = ({ task, metadata, savedContact, closeModal, finaliseContact }) => {
  const { newSubmitHandler, strings } = useTabbedForm();

  const submit = async (caseForm: CaseForm) => {
    try {
      await finaliseContact(savedContact, metadata, caseForm);
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
  const onNewCaseSaved = async (caseForm: CaseForm) => {
    await newSubmitHandler(() => submit(caseForm))();
  };

  return (
    <CaseLayout>
      <Case task={task} onNewCaseSaved={onNewCaseSaved} handleClose={closeModal} />
    </CaseLayout>
  );
};

TabbedFormsCase.displayName = 'TabbedFormsCase';

export default connector(TabbedFormsCase);
