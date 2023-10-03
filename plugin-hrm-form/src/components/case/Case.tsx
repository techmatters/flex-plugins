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
import { AnyAction, bindActionCreators } from 'redux';

import {
  configurationBase,
  connectedCaseBase,
  contactFormsBase,
  namespace,
  RootState,
  routingBase,
  // saveCaseBase,
} from '../../states';
import { cancelCase } from '../../services/CaseService';
import { connectToCase } from '../../services/ContactService';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getActivitiesFromCase, getActivitiesFromContacts, isNoteActivity, sortActivities } from './caseActivities';
import { getHelplineData } from './caseHelpers';
import { getLocaleDateTime } from '../../utils/helpers';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import ViewContact from './ViewContact';
import { Activity, CaseDetails, ConnectedCaseActivity, NoteActivity } from '../../states/case/types';
import { Case as CaseType, CustomITask, Contact, StandaloneITask } from '../../types/types';
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
import { ChannelTypes } from '../../states/DomainConstants';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { updateCaseAsyncAction } from '../../states/case/saveCase';
import asyncDispatch from '../../states/asyncDispatch';

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
  counselorsHash,
  removeConnectedCase,
  changeRoute,
  isCreating,
  handleClose,
  routing,
  savedContacts,
  loadContact,
  loadContacts,
  releaseContacts,
  cancelNewCase,
  updateCaseAsyncAction,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [loadedContactIds, setLoadedContactIds] = useState([]);
  const { connectedCase } = props?.connectedCaseState ?? {};
  // This is to provide a stable dep for the useEffect that generates the timeline
  const savedContactsJson = JSON.stringify(savedContacts);
  const { workerSid } = getHrmConfig();
  const strings = getTemplateStrings();

  const timeline: Activity[] = useMemo(
    () => {
      const { connectedCaseId, definitionVersions, connectedCaseState } = props;
      /**
       * Gets the activities timeline from current caseId
       * If the case is just being created, adds the case's description as a new activity
       */
      if (!connectedCaseId) return [];

      const { connectedCase } = connectedCaseState;

      const timelineActivities = [
        ...getActivitiesFromCase(
          connectedCase,
          definitionVersions[connectedCase.info.definitionVersion] ?? props.currentDefinitionVersion,
        ),
        ...getActivitiesFromContacts(savedContacts ?? []),
      ];
      return sortActivities(timelineActivities);
    },
    // savedContacts is not present but savedContactsJson is
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedContactsJson, task, props.connectedCaseId, props.connectedCaseState?.connectedCase],
  );

  useEffect(() => {
    if (!connectedCase) return;
    const { connectedContacts } = connectedCase;
    loadContacts(connectedContacts, task.taskSid);
    setLoadedContactIds(connectedContacts.map(cc => cc.id));
  }, [connectedCase, loadContact, loadContacts, releaseContacts, task, workerSid]);

  const version = props.connectedCaseState?.connectedCase.info.definitionVersion;
  const { updateDefinitionVersion, definitionVersions } = props;

  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  useEffect(() => {
    const fetchDefinitionVersions = async () => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(connectedCase, version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions();
    }
  }, [connectedCase, definitionVersions, task.taskSid, updateDefinitionVersion, version]);

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

  const definitionVersion = props.definitionVersions[version];

  if (!props.connectedCaseState || !definitionVersion) return null;

  const getCategories = (firstConnectedContact: Contact): Record<string, string[]> => {
    return firstConnectedContact?.rawJson.categories ?? {};
  };

  const { can } = getPermissionsForCase(connectedCase.twilioWorkerId, connectedCase.status);

  const firstConnectedContact = savedContacts && savedContacts[0];

  const categories = getCategories(firstConnectedContact) ?? {};
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
  const office = getHelplineData(connectedCase.helpline, definitionVersion.helplineInformation);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      updateCaseAsyncAction(connectedCase.id, {
        ...connectedCase,
      });
    } catch (error) {
      console.error(error);
      recordBackendError('Update Case', error);
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

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      releaseContacts(loadedContactIds, task.taskSid);
      updateCaseAsyncAction(connectedCase.id, {
        ...connectedCase,
      });
      await connectToCase(firstConnectedContact.id, connectedCase.id);
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
          {...{
            counselorsHash,
            onClickClose: handleCloseSection,
            definitionVersion,
          }}
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
  const { definitionVersions, currentDefinitionVersion } = state[namespace][configurationBase];
  return {
    connectedCaseState: caseState,
    connectedCaseId: connectedCase?.id,
    counselorsHash: state[namespace][configurationBase].counselors.hash,
    routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
    definitionVersions,
    currentDefinitionVersion,
    savedContacts: Object.values(state[namespace][contactFormsBase].existingContacts)
      .filter(contact => connectedContactIds.has(contact.savedContact.id))
      .map(ecs => ecs.savedContact),
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => {
  const updateCaseAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  const cancelNewCase = (taskSid: string, loadedContactIds: string[]) => {
    dispatch(CaseActions.removeConnectedCase(taskSid));
    dispatch(
      RoutingActions.changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation', autoFocus: true }, taskSid),
    );
    dispatch(ContactActions.releaseContacts(loadedContactIds, taskSid));
  };
  const updateCaseDefinition = (connectedCase: CaseType, taskSid: string, definition) => {
    dispatch(ConfigActions.updateDefinitionVersion(connectedCase.info.definitionVersion, definition));
  };
  return {
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    removeConnectedCase: bindActionCreators(CaseActions.removeConnectedCase, dispatch),
    updateDefinitionVersion: updateCaseDefinition,
    releaseContacts: bindActionCreators(ContactActions.releaseContacts, dispatch),
    loadContacts: bindActionCreators(ContactActions.loadContacts, dispatch),
    loadContact: bindActionCreators(ContactActions.loadContact, dispatch),
    cancelNewCase,
    updateCaseAsyncAction: (caseId: CaseType['id'], body: Partial<CaseType>) =>
      updateCaseAsyncDispatch(updateCaseAsyncAction(caseId, task.taskSid, body)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
