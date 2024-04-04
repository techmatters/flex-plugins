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
/* eslint-disable sonarjs/cognitive-complexity */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/CreateNewFolderOutlined';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { BottomButtonBar, Box, SaveAndEndButton, StyledNextStepButton } from '../../styles';
import { AddedToCaseButton } from './styles';
import * as RoutingActions from '../../states/routing/actions';
import { completeTask } from '../../services/formSubmissionHelpers';
import { hasTaskControl } from '../../transfer/transferTaskState';
import { RootState } from '../../states';
import { isNonDataCallType } from '../../states/validationRules';
import { recordBackendError } from '../../fullStory';
import { Contact, CustomITask, RouterTask } from '../../types/types';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { createCaseAsyncAction } from '../../states/case/saveCase';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { submitContactFormAsyncAction } from '../../states/contacts/saveContact';
import { ContactMetadata, LoadingStatus } from '../../states/contacts/types';
import { AppRoutes } from '../../states/routing/types';
import AddCaseButton from '../AddCaseButton';
import asyncDispatch from '../../states/asyncDispatch';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { SuccessReportIcon } from '../CSAMReport/styles';
import { CaseStateEntry } from '../../states/case/types';

type BottomBarProps = {
  handleSubmitIfValid: (handleSubmit: () => Promise<void>) => () => void;
  optionalButtons?: { onClick: () => void; label: string }[];
  showNextButton: boolean;
  showSubmitButton: boolean;
  nextTab: () => void;
  task: RouterTask;
  contactId: string;
  saveUpdates: () => Promise<void>;
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
  openModal,
  nextTab,
  caseState,
  createCaseAsyncAction,
  submitContactForm,
  saveUpdates,
  savedContact,
  contactIsSaving,
}) => {
  const strings = getTemplateStrings();

  const isAddedToCase = savedContact?.caseId;

  const handleOpenNewCase = async () => {
    const { workerSid, definitionVersion } = getHrmConfig();

    if (!hasTaskControl(task)) return;

    try {
      await saveUpdates();
      await createCaseAsyncAction(contact, workerSid, definitionVersion);
      openModal({
        contextContactId: savedContact.id,
        route: 'case',
        subroute: 'home',
        isCreating: true,
        caseId: undefined,
      });
    } catch (error) {
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  const handleSubmit = async () => {
    if (contactIsSaving || !hasTaskControl(task)) return;

    try {
      await submitContactForm(task as CustomITask, contact, metadata, caseState);
      await completeTask(task, contact);
    } catch (error) {
      if (window.confirm(strings['Error-ContinueWithoutRecording'])) {
        recordBackendError('Submit Contact Form TASK COMPLETED WITHOUT RECORDING', error);
        await completeTask(task, contact);
      } else {
        recordBackendError('Submit Contact Form', error);
      }
    }
  };

  const showBottomBar = showNextButton || showSubmitButton;
  const featureFlags = getAseloFeatureFlags();

  if (!showBottomBar) return null;

  const openSearchModal = () => {
    openModal({ contextContactId: savedContact.id, route: 'search', subroute: 'form', action: 'select-case' });
  };

  const renderCaseButton = () => {
    if (featureFlags.enable_case_merging) {
      if (isAddedToCase) {
        return (
          <Box marginRight="25px">
            <AddedToCaseButton>
              <Box marginRight="10px">
                <SuccessReportIcon style={{ verticalAlign: 'middle' }} />
              </Box>
              <Template code="BottomBar-AddedToCase" />
            </AddedToCaseButton>
          </Box>
        );
      } else if (!isNonDataCallType(contact.rawJson.callType)) {
        return (
          <Box marginRight="15px">
            <AddCaseButton handleNewCaseType={handleOpenNewCase} handleExistingCaseType={openSearchModal} />
          </Box>
        );
      }
      return null;
    }
    return isAddedToCase ? null : (
      <Box marginRight="15px">
        <StyledNextStepButton
          type="button"
          roundCorners
          secondary="true"
          onClick={handleSubmitIfValid(handleOpenNewCase)}
          data-fs-id="Contact-SaveAndAddToCase-Button"
          data-testid="BottomBar-SaveAndAddToCase-Button"
        >
          <FolderIcon style={{ fontSize: '16px', marginRight: '10px', width: '24px', height: '24px' }} />
          <Template code="BottomBar-AddContactToNewCase" />
        </StyledNextStepButton>
      </Box>
    );
  };

  return (
    <BottomButtonBar>
      {optionalButtons &&
        optionalButtons.map((i, index) => (
          <Box key={`optional-button-${index}`} marginRight="15px">
            <StyledNextStepButton
              type="button"
              roundCorners
              secondary="true"
              onClick={i.onClick}
              disabled={contactIsSaving}
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
          {renderCaseButton()}

          <SaveAndEndButton
            roundCorners={true}
            onClick={handleSubmitIfValid(handleSubmit)}
            disabled={contactIsSaving}
            data-fs-id="Contact-SaveContact-Button"
            data-testid="BottomBar-SaveContact-Button"
          >
            <span style={{ visibility: contactIsSaving ? 'hidden' : 'inherit' }}>
              <Template code="BottomBar-SaveAndEnd" />
            </span>
            {contactIsSaving ? <CircularProgress size={12} style={{ position: 'absolute' }} /> : null}
          </SaveAndEndButton>
        </>
      )}
    </BottomButtonBar>
  );
};

BottomBar.displayName = 'BottomBar';

const mapStateToProps = (state: RootState, { contactId }: BottomBarProps) => {
  const { draftContact, savedContact, metadata } = selectContactStateByContactId(state, contactId) ?? {};
  const caseState = selectCaseByCaseId(state, savedContact.caseId ?? '');
  const contactIsSaving = metadata.loadingStatus === LoadingStatus.LOADING || savedContact.finalizedAt !== null;
  return {
    contact: getUnsavedContact(savedContact, draftContact),
    metadata,
    caseState,
    savedContact,
    contactIsSaving,
  };
};

const mapDispatchToProps = (dispatch, { task }: BottomBarProps) => {
  return {
    changeRoute: (route: AppRoutes) => dispatch(RoutingActions.changeRoute(route, task.taskSid)),
    openModal: (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid)),
    createCaseAsyncAction: async (contact, workerSid: string, definitionVersion: DefinitionVersionId) => {
      // Deliberately using dispatch rather than asyncDispatch here, because we still handle the error from where the action is dispatched.
      // TODO: Rework error handling to be based on redux state set by the _REJECTED action
      await asyncDispatch(dispatch)(createCaseAsyncAction(contact, workerSid, definitionVersion));
    },
    submitContactForm: (task: CustomITask, contact: Contact, metadata: ContactMetadata, caseState: CaseStateEntry) =>
      // Deliberately using dispatch rather than asyncDispatch here, because we still handle the error from where the action is dispatched.
      // TODO: Rework error handling to be based on redux state set by the _REJECTED action
      dispatch(submitContactFormAsyncAction(task, contact, metadata, caseState)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
