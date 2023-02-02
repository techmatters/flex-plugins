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

/* eslint-disable react/prop-types,complexity,sonarjs/cognitive-complexity */
import React, { useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { bindActionCreators } from 'redux';

import {
  configurationBase,
  connectedCaseBase,
  contactFormsBase,
  namespace,
  RootState,
  routingBase,
} from '../../states';
import { getConfig } from '../../HrmFormPlugin';
import { connectToCase, transformCategories } from '../../services/ContactService';
import { cancelCase, updateCase } from '../../services/CaseService';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getActivitiesFromCase, getActivitiesFromContacts, isNoteActivity, sortActivities } from './caseActivities';
import { getDateFromNotSavedContact, getHelplineData } from './caseHelpers';
import { getLocaleDateTime } from '../../utils/helpers';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import ViewContact from './ViewContact';
import { Activity, CaseDetails, CaseDetailsName, ConnectedCaseActivity, NoteActivity } from '../../states/case/types';
import { Case as CaseType, CustomITask, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import {
  AppRoutes,
  AppRoutesWithCase,
  CaseItemAction,
  isAddCaseSectionRoute,
  isEditCaseSectionRoute,
  isViewCaseSectionRoute,
  NewCaseSubroutes,
} from '../../states/routing/types';
import CaseHome from './CaseHome';
import AddEditCaseItem, { AddEditCaseItemProps } from './AddEditCaseItem';
import ViewCaseItem from './ViewCaseItem';
import documentUploadHandler from './documentUploadHandler';
import { recordBackendError } from '../../fullStory';
import { completeTask, submitContactForm } from '../../services/formSubmissionHelpers';
import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { CenteredContainer } from '../../styles/case';
import EditCaseSummary from './EditCaseSummary';
import { documentSectionApi } from '../../states/case/sections/document';
import { incidentSectionApi } from '../../states/case/sections/incident';
import { perpetratorSectionApi } from '../../states/case/sections/perpetrator';
import { householdSectionApi } from '../../states/case/sections/household';
import { referralSectionApi } from '../../states/case/sections/referral';
import { noteSectionApi } from '../../states/case/sections/note';
import { CaseSectionApi } from '../../states/case/sections/api';
import * as ContactActions from '../../states/contacts/existingContacts';
import { searchContactToHrmServiceContact, taskFormToSearchContact } from '../../states/contacts/contactDetailsAdapter';
import { ChannelTypes } from '../../states/DomainConstants';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  isCreating?: boolean;
  handleClose?: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const newContactTemporaryId = (connectedCase: CaseType) => `__unsavedFromCase:${connectedCase?.id}`;

const Case: React.FC<Props> = ({
  task,
  form,
  counselorsHash,
  setConnectedCase,
  removeConnectedCase,
  changeRoute,
  isCreating,
  handleClose,
  routing,
  newContact,
  savedContacts,
  loadContact,
  loadRawContacts,
  releaseContacts,
  cancelNewCase,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [loadedContactIds, setLoadedContactIds] = useState([]);
  const { connectedCase } = props?.connectedCaseState ?? {};
  // This is to provide a stable dep for the useEffect that generates the timeline
  const savedContactsJson = JSON.stringify(savedContacts);
  const { workerSid } = getConfig();

  const timeline: Activity[] = useMemo(
    () => {
      /**
       * Gets the activities timeline from current caseId
       * If the case is just being created, adds the case's description as a new activity
       */
      if (!props.connectedCaseId) return [];

      const timelineActivities = [
        ...getActivitiesFromCase(props.connectedCaseState.connectedCase),
        ...getActivitiesFromContacts(savedContacts ?? []),
      ];

      if (newContact && !isStandaloneITask(task)) {
        const connectCaseActivity: ConnectedCaseActivity = {
          contactId: newContact.id,
          date: newContact.timeOfContact,
          createdAt: new Date().toISOString(),
          type: task.channelType,
          text: newContact.rawJson.caseInformation.callSummary.toString(),
          twilioWorkerId: workerSid,
          channel:
            task.channelType === 'default'
              ? newContact.rawJson.contactlessTask.channel
              : (task.channelType as ChannelTypes),
          callType: newContact.rawJson.callType,
        };

        timelineActivities.push(connectCaseActivity);
      }
      return sortActivities(timelineActivities);
    },
    // savedContacts is not present but savedContactsJson is
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newContact, savedContactsJson, task, form, props.connectedCaseId, props.connectedCaseState?.connectedCase],
  );

  useEffect(() => {
    if (!connectedCase) return;
    const { connectedContacts } = connectedCase;
    if (connectedContacts?.length) {
      loadRawContacts(connectedContacts, task.taskSid);
      setLoadedContactIds(connectedContacts.map(cc => cc.id));
    } else if (!isStandaloneITask(task)) {
      setLoadedContactIds([newContactTemporaryId(connectedCase)]);
      loadContact(
        taskFormToSearchContact(
          task,
          form,
          getDateFromNotSavedContact(task, form).toISOString(),
          workerSid,
          newContactTemporaryId(connectedCase),
        ),
        task.taskSid,
      );
    }
  }, [connectedCase, form, loadContact, loadRawContacts, releaseContacts, task, workerSid]);

  const version = props.connectedCaseState?.connectedCase.info.definitionVersion;
  const { updateDefinitionVersion, definitionVersions } = props;

  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  useEffect(() => {
    const fetchDefinitionVersions = async () => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(connectedCase, version, definitionVersion);
      setConnectedCase(connectedCase, task.taskSid);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions();
    }
  }, [connectedCase, definitionVersions, setConnectedCase, task.taskSid, updateDefinitionVersion, version]);

  if (routing.route === 'csam-report') return null;

  // Redirects to the proper view when the user clicks 'Close' button.
  const closeSubSectionRoute = (): AppRoutesWithCase => {
    switch (routing.route) {
      case 'select-call-type': {
        return { route: 'select-call-type' };
      }
      case 'new-case': {
        return { route: 'new-case' };
      }
      default: {
        return { route: 'tabbed-forms', subroute: 'search' };
      }
    }
  };

  const handleCloseSection = () => changeRoute(closeSubSectionRoute(), task.taskSid);

  if (!props.connectedCaseState) return null;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories && form?.helpline) {
      return transformCategories(form.helpline, form.categories);
    }
    return null;
  };

  const { can } = getPermissionsForCase(connectedCase.twilioWorkerId, connectedCase.status);

  const firstConnectedContact = (savedContacts && savedContacts[0]) ?? newContact;

  const categories = getCategories(firstConnectedContact);
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const caseCounselor = counselorsHash[twilioWorkerId];
  const currentCounselor = counselorsHash[workerSid];
  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  // -- Converting followUpDate to match the same format as the rest of the dates
  const followUpPrintedDate = info && info.followUpDate ? getLocaleDateTime(info.followUpDate) : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];
  const documents = info && info.documents ? info.documents : [];
  const childIsAtRisk = Boolean(info && info.childIsAtRisk);
  const referrals = info?.referrals;
  const notes: NoteActivity[] = timeline.filter(x => isNoteActivity(x)) as NoteActivity[];
  const summary = info?.summary;
  const definitionVersion = props.definitionVersions[version];
  const office = getHelplineData(connectedCase.helpline, definitionVersion.helplineInformation);

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      setConnectedCase(updatedCase, task.taskSid);
    } catch (error) {
      console.error(error);
      recordBackendError('Update Case', error);
      const { strings } = getConfig();
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNewCaseAndClose = async () => {
    await cancelCase(connectedCase.id);
    cancelNewCase(task.taskSid, loadedContactIds);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      releaseContacts(loadedContactIds, task.taskSid);
      const contact = await submitContactForm(task, form, connectedCase);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(contact.id, connectedCase.id);
      await completeTask(task);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const caseDetails: CaseDetails = {
    id: connectedCase.id,
    contactIdentifier: contactLabelFromHrmContact(definitionVersion, firstConnectedContact, {
      placeholder: '',
      substituteForId: false,
    }),
    categories,
    status,
    caseCounselor,
    currentCounselor,
    createdAt,
    updatedAt,
    followUpDate,
    followUpPrintedDate,
    households,
    perpetrators,
    incidents,
    referrals,
    documents,
    notes,
    summary,
    childIsAtRisk,
    office,
    version,
    contact: firstConnectedContact,
    contacts: savedContacts ?? [],
  };
  if (isAddCaseSectionRoute(routing) || isViewCaseSectionRoute(routing) || isEditCaseSectionRoute(routing)) {
    const { subroute } = routing;

    const addScreenProps = {
      task,
      routing,
      counselor: currentCounselor,
      counselorsHash,
      definitionVersion,
    };

    const renderCaseItemPage = (
      sectionApi: CaseSectionApi<unknown>,
      editPermission: typeof PermissionActions[keyof typeof PermissionActions],
      extraAddEditProps: Partial<AddEditCaseItemProps> = {},
    ) => {
      if (isViewCaseSectionRoute(routing)) {
        return (
          <ViewCaseItem
            {...addScreenProps}
            routing={routing}
            sectionApi={sectionApi}
            canEdit={() => can(editPermission)}
            exitItem={handleCloseSection}
          />
        );
      }
      const exitRoute: AppRoutes = isEditCaseSectionRoute(routing)
        ? ({ ...routing, action: CaseItemAction.View } as AppRoutes)
        : closeSubSectionRoute();
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            ...extraAddEditProps,
            sectionApi,
          }}
          exitRoute={exitRoute}
          routing={routing}
        />
      );
    };

    switch (subroute) {
      case NewCaseSubroutes.Note:
        return renderCaseItemPage(noteSectionApi, PermissionActions.EDIT_NOTE);
      case NewCaseSubroutes.Referral:
        return renderCaseItemPage(referralSectionApi, PermissionActions.EDIT_REFERRAL);
      case NewCaseSubroutes.Household:
        return renderCaseItemPage(householdSectionApi, PermissionActions.EDIT_HOUSEHOLD);
      case NewCaseSubroutes.Perpetrator:
        return renderCaseItemPage(perpetratorSectionApi, PermissionActions.EDIT_PERPETRATOR);
      case NewCaseSubroutes.Incident:
        return renderCaseItemPage(incidentSectionApi, PermissionActions.EDIT_INCIDENT);
      case NewCaseSubroutes.Document:
        return renderCaseItemPage(documentSectionApi, PermissionActions.EDIT_DOCUMENT, {
          customFormHandlers: documentUploadHandler,
          reactHookFormOptions: {
            shouldUnregister: false,
          },
        });
      case NewCaseSubroutes.CaseSummary:
        return (
          <EditCaseSummary
            {...{
              ...addScreenProps,
              exitRoute: closeSubSectionRoute(),
              can,
            }}
          />
        );
      default:
      // Fall through to next switch for other routes without actions
    }
  }

  switch (routing.subroute) {
    case NewCaseSubroutes.ViewContact:
      return <ViewContact onClickClose={handleCloseSection} contactId={routing.id} task={task} />;
    case NewCaseSubroutes.CasePrintView:
      return (
        <CasePrintView
          caseDetails={caseDetails}
          {...{ counselorsHash, onClickClose: handleCloseSection, definitionVersion }}
        />
      );
    default:
      return loading || !definitionVersion ? (
        <CenteredContainer>
          <CircularProgress size={50} />
        </CenteredContainer>
      ) : (
        <CaseHome
          task={task}
          definitionVersion={definitionVersion}
          caseDetails={caseDetails}
          timeline={timeline}
          handleClose={() => {
            releaseContacts(loadedContactIds, task.taskSid);
            handleClose();
          }}
          handleCancelNewCaseAndClose={handleCancelNewCaseAndClose}
          handleUpdate={handleUpdate}
          handleSaveAndEnd={handleSaveAndEnd}
          isCreating={isCreating}
          can={can}
        />
      );
  }
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const { connectedCase } = caseState ?? {};
  const connectedContactIds = new Set((connectedCase?.connectedContacts ?? []).map(cc => cc.id as string));
  const newSearchContact =
    state[namespace][contactFormsBase].existingContacts[newContactTemporaryId(connectedCase)]?.savedContact;
  return {
    form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
    connectedCaseState: caseState,
    connectedCaseId: connectedCase?.id,
    counselorsHash: state[namespace][configurationBase].counselors.hash,
    routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
    definitionVersions: state[namespace][configurationBase].definitionVersions,
    savedContacts: Object.values(state[namespace][contactFormsBase].existingContacts)
      .filter(contact => connectedContactIds.has(contact.savedContact.contactId))
      .map(ecs => searchContactToHrmServiceContact(ecs.savedContact)),
    newContact: newSearchContact ? searchContactToHrmServiceContact(newSearchContact) : undefined,
  };
};

const mapDispatchToProps = dispatch => {
  const cancelNewCase = (taskSid: string, loadedContactIds: string[]) => {
    dispatch(CaseActions.removeConnectedCase(taskSid));
    dispatch(
      RoutingActions.changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation', autoFocus: true }, taskSid),
    );
    dispatch(ContactActions.releaseContacts(loadedContactIds, taskSid));
  };
  const updateCaseDefinition = (connectedCase: CaseType, taskSid: string, definition) => {
    dispatch(ConfigActions.updateDefinitionVersion(connectedCase.info.definitionVersion, definition));
    dispatch(CaseActions.setConnectedCase(connectedCase, taskSid));
  };
  return {
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    removeConnectedCase: bindActionCreators(CaseActions.removeConnectedCase, dispatch),
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    updateDefinitionVersion: updateCaseDefinition,
    releaseContacts: bindActionCreators(ContactActions.releaseContacts, dispatch),
    loadRawContacts: bindActionCreators(ContactActions.loadRawContacts, dispatch),
    loadContact: bindActionCreators(ContactActions.loadContact, dispatch),
    cancelNewCase,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
