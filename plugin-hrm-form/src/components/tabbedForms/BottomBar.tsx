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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { AnyAction, bindActionCreators } from 'redux';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import { SubmitErrorHandler } from 'react-hook-form';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { completeTask } from '../../services/formSubmissionHelpers';
import { hasTaskControl } from '../../utils/transfer';
import { namespace, contactFormsBase, connectedCaseBase, RootState } from '../../states';
import { isNonDataCallType } from '../../states/validationRules';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';
import { Case, CustomITask, Contact } from '../../types/types';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { createCaseAsyncAction } from '../../states/case/saveCase';
import asyncDispatch from '../../states/asyncDispatch';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { submitContactFormAsyncAction } from '../../states/contacts/saveContact';
import { ContactMetadata } from '../../states/contacts/types';

type BottomBarProps = {
  handleSubmitIfValid: (handleSubmit: () => void, onError: SubmitErrorHandler<unknown>) => () => void;
  optionalButtons?: { onClick: () => void; label: string }[];
  showNextButton: boolean;
  showSubmitButton: boolean;
  nextTab: () => void;
  task: CustomITask;
  contactId: string;
  saveUpdates: () => Promise<Contact>;
};

const BottomBar: React.FC<
  BottomBarProps & ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>
> = ({
  showNextButton,
  showSubmitButton,
  handleSubmitIfValid,
  optionalButtons,
  contact,
  metadata,
  task,
  changeRoute,
  nextTab,
  caseForm,
  createCaseAsyncAction,
  submitContactFormAsyncAction,
  saveUpdates,
}) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const strings = getTemplateStrings();

  const handleOpenNewCase = async () => {
    const { taskSid } = task;
    const { workerSid, definitionVersion } = getHrmConfig();

    if (!hasTaskControl(task)) return;

    try {
      const updated = (await saveUpdates()) ?? contact;
      await createCaseAsyncAction(updated, workerSid, definitionVersion);
      changeRoute({ route: 'new-case' }, taskSid);
    } catch (error) {
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !hasTaskControl(task)) return;

    setSubmitting(true);

    try {
      submitContactFormAsyncAction(task, contact, metadata, caseForm as Case);
      await completeTask(task);
    } catch (error) {
      if (window.confirm(strings['Error-ContinueWithoutRecording'])) {
        recordBackendError('Submit Contact Form TASK COMPLETED WITHOUT RECORDING', error);
        await completeTask(task);
      } else {
        recordBackendError('Submit Contact Form', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onError = recordingErrorHandler('Tabbed HRM Form', () => {
    window.alert(strings['Error-Form']);
  });

  const showBottomBar = showNextButton || showSubmitButton;
  const featureFlags = getAseloFeatureFlags();

  if (!showBottomBar) return null;

  return (
    <>
      <BottomButtonBar>
        {optionalButtons &&
          optionalButtons.map((i, index) => (
            <Box key={`optional-button-${index}`} marginRight="15px">
              <StyledNextStepButton
                type="button"
                roundCorners
                secondary="true"
                onClick={i.onClick}
                disabled={isSubmitting}
              >
                <Template code={i.label} />
              </StyledNextStepButton>
            </Box>
          ))}

        {showNextButton && (
          <StyledNextStepButton type="button" roundCorners={true} onClick={nextTab}>
            <Template code="BottomBar-Next" />
          </StyledNextStepButton>
        )}
        {showSubmitButton && (
          <>
            {featureFlags.enable_case_management && !isNonDataCallType(contact.rawJson.callType) && (
              <Box marginRight="15px">
                <StyledNextStepButton
                  type="button"
                  roundCorners
                  secondary="true"
                  onClick={handleSubmitIfValid(handleOpenNewCase, onError)}
                  data-fs-id="Contact-SaveAndAddToCase-Button"
                  data-testid="BottomBar-SaveAndAddToCase-Button"
                >
                  <FolderIcon style={{ fontSize: '16px', marginRight: '10px' }} />
                  <Template code="BottomBar-AddContactToNewCase" />
                </StyledNextStepButton>
              </Box>
            )}
            <StyledNextStepButton
              roundCorners={true}
              onClick={handleSubmitIfValid(handleSubmit, onError)}
              disabled={isSubmitting}
              data-fs-id="Contact-SaveContact-Button"
              data-testid="BottomBar-SaveContact-Button"
            >
              <span style={{ visibility: isSubmitting ? 'hidden' : 'inherit' }}>
                <Template code="BottomBar-SaveCaseContact" />
              </span>
              {isSubmitting ? <CircularProgress size={12} style={{ position: 'absolute' }} /> : null}
            </StyledNextStepButton>
          </>
        )}
      </BottomButtonBar>
    </>
  );
};

BottomBar.displayName = 'BottomBar';

const mapStateToProps = (state: RootState, ownProps: BottomBarProps) => {
  const { draftContact, savedContact, metadata } =
    state[namespace][contactFormsBase].existingContacts[ownProps.contactId] ?? {};
  const caseForm = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase || {};
  return {
    contact: getUnsavedContact(savedContact, draftContact),
    metadata,
    caseForm,
  };
};

const mapDispatchToProps = (dispatch, { task }: BottomBarProps) => {
  const createCaseAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    createCaseAsyncAction: (contact, workerSid: string, definitionVersion: DefinitionVersionId) =>
      createCaseAsyncDispatch(createCaseAsyncAction(contact, task.taskSid, workerSid, definitionVersion)),
    submitContactFormAsyncAction: (task: CustomITask, contact: Contact, metadata: ContactMetadata, caseForm: Case) =>
      createCaseAsyncDispatch(submitContactFormAsyncAction(task, contact, metadata, caseForm)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
