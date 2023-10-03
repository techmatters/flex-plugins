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
/* eslint-disable react/prop-types */
import React from 'react';
import { ITask, TaskHelper, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes, CallTypeButtonsEntry } from 'hrm-form-definitions';

import { namespace, contactFormsBase, configurationBase, connectedCaseBase, RootState } from '../../states';
import { SearchContactDraftChanges, updateDraft as newUpdateDraftAction } from '../../states/contacts/existingContacts';
import { changeRoute as newChangeRouteAction } from '../../states/routing/actions';
import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import { isNonDataCallType } from '../../states/validationRules';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { submitContactForm, completeTask } from '../../services/formSubmissionHelpers';
import CallTypeIcon from '../common/icons/CallTypeIcon';
import { CustomITask, Contact, isOfflineContactTask } from '../../types/types';
import { getTemplateStrings } from '../../hrmConfig';
import { AppRoutes } from '../../states/routing/types';

const isDialogOpen = (contact: SearchContactDraftChanges) =>
  Boolean(contact?.rawJson?.callType && isNonDataCallType(contact?.rawJson?.callType));

type OwnProps = {
  task: CustomITask;
  localization: { manager: { status: any }; isCallTask: (task: ITask) => boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CallTypeButtons: React.FC<Props> = ({
  savedContact,
  draftContact,
  metadata,
  task,
  localization,
  currentDefinitionVersion,
  caseForm,
  updateCallType,
  clearCallType,
  changeRoute,
}) => {
  const { isCallTask } = localization;

  // Todo: need to handle this error scenario in a better way. Currently is showing a blank screen if there aren't definitions.
  if (!currentDefinitionVersion) return null;
  const { callTypeButtons } = currentDefinitionVersion;

  const handleClick = (callTypeEntry: CallTypeButtonsEntry) => {
    if (!hasTaskControl(task)) return;

    /*
     *  TODO: We currently save the call type name in English if data or the label string if non-data.
     * I think we should actually save callType.name (instead of label) on the DB, and use it in here.
     */
    const callType = callTypes[callTypeEntry.name] ? callTypes[callTypeEntry.name] : callTypeEntry.label;

    updateCallType(savedContact.id, callType);
  };

  const handleClickAndRedirect = (callTypeEntry: CallTypeButtonsEntry) => {
    if (!hasTaskControl(task)) return;

    // eslint-disable-next-line no-nested-ternary
    const subroute = isOfflineContactTask(task)
      ? 'contactlessTask'
      : callTypeEntry.name === 'caller'
      ? 'callerInformation'
      : 'childInformation';

    handleClick(callTypeEntry);
    changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true });
  };

  const handleNonDataClick = (taskSid: string, callTypeEntry: CallTypeButtonsEntry) => {
    if (isOfflineContactTask(task)) {
      handleClickAndRedirect(callTypeEntry);
    } else {
      handleClick(callTypeEntry);
    }
  };

  const handleConfirmNonDataCallType = async () => {
    if (!hasTaskControl(task)) return;

    try {
      await submitContactForm(
        task,
        { ...savedContact, ...draftContact, rawJson: { ...savedContact.rawJson, ...draftContact.rawJson } },
        metadata,
        caseForm,
      );
      await completeTask(task);
    } catch (error) {
      const strings = getTemplateStrings();
      if (!window.confirm(strings['Error-ContinueWithoutRecording'])) {
        await completeTask(task);
      }
    }
  };

  return (
    <>
      <Container>
        <Box marginBottom="29px">
          <Label style={{ width: 'auto' }}>
            <Template code="CallTypeButtons-Categorize" />
          </Label>
          {callTypeButtons
            .filter(entry => entry.category === 'data')
            .map((callType, index) => {
              return (
                <DataCallTypeButton
                  onClick={() => handleClickAndRedirect(callType)}
                  key={callType.name}
                  autoFocus={index === 0}
                  data-testid={`DataCallTypeButton-${callType.name}`}
                >
                  <Flex width="50px" marginRight="5px">
                    {/* TODO: We currently need the call type name in English. I think we should actually save callType.name (instead of label) on the DB, and use it in here.  */}
                    <CallTypeIcon callType={callTypes[callType.name]} />
                  </Flex>
                  {callType.label}
                </DataCallTypeButton>
              );
            })}
        </Box>

        <Box>
          <Label style={{ width: 'auto' }}>
            <Template code="CallTypeButtons-Or" />
          </Label>
          {callTypeButtons
            .filter(entry => entry.category === 'non-data')
            .map((callType, i) => (
              <NonDataCallTypeButton
                key={callType.name}
                onClick={() => handleNonDataClick(task.taskSid, callType)}
                marginRight={i % 2 === 0}
              >
                {callType.label}
              </NonDataCallTypeButton>
            ))}
        </Box>
      </Container>
      <NonDataCallTypeDialog
        isOpen={isDialogOpen(draftContact)}
        isCallTask={!isOfflineContactTask(task) && isCallTask(task)}
        isInWrapupMode={!isOfflineContactTask(task) && TaskHelper.isInWrapupMode(task)}
        handleConfirm={handleConfirmNonDataCallType}
        handleCancel={() => clearCallType(savedContact?.id)}
      />
    </>
  );
};

CallTypeButtons.displayName = 'CallTypeButtons';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { savedContact, metadata, draftContact } =
    Object.values(state[namespace][contactFormsBase].existingContacts).find(
      cs => cs.savedContact.taskId === ownProps.task.taskSid,
    ) ?? {};
  const caseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const caseForm = caseState && caseState.connectedCase;
  const { currentDefinitionVersion } = state[namespace][configurationBase];

  return { savedContact, draftContact, metadata, caseForm, currentDefinitionVersion };
};

const mapDispatchToProps = (dispatch, { task: { taskSid } }: OwnProps) => ({
  changeRoute: (route: AppRoutes) => dispatch(newChangeRouteAction(route, taskSid)),
  updateCallType: (contactId: string, callType: string) =>
    dispatch(newUpdateDraftAction(contactId, { rawJson: { callType } })),
  clearCallType: (contactId: string) => dispatch(newUpdateDraftAction(contactId, { rawJson: { callType: null } })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CallTypeButtons);

export default withLocalization(connected);
