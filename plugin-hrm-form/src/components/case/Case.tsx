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
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { AnyAction, bindActionCreators } from 'redux';
import { parseISO } from 'date-fns';

import { RootState } from '../../states';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getNoteActivities, sortActivities } from '../../states/case/caseActivities';
import { getHelplineData } from './caseHelpers';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import { CaseDetails } from '../../states/case/types';
import { Case as CaseType, Contact, CustomITask, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import {
  CaseRoute,
  ChangeRouteMode,
  isAddCaseSectionRoute,
  isEditCaseSectionRoute,
  isViewCaseSectionRoute,
  NewCaseSubroutes,
} from '../../states/routing/types';
import CaseHome from './CaseHome';
import AddEditCaseItem, { AddEditCaseItemProps } from './AddEditCaseItem';
import ViewCaseItem from './ViewCaseItem';
import { bindFileUploadCustomHandlers } from './documentUploadHandler';
import { recordBackendError } from '../../fullStory';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { CenteredContainer } from './styles';
import EditCaseSummary from './EditCaseSummary';
import { documentSectionApi } from '../../states/case/sections/document';
import { incidentSectionApi } from '../../states/case/sections/incident';
import { perpetratorSectionApi } from '../../states/case/sections/perpetrator';
import { householdSectionApi } from '../../states/case/sections/household';
import { referralSectionApi } from '../../states/case/sections/referral';
import { noteSectionApi } from '../../states/case/sections/note';
import { CaseSectionApi } from '../../states/case/sections/api';
import * as ContactActions from '../../states/contacts/existingContacts';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { updateCaseAsyncAction } from '../../states/case/saveCase';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction, submitContactFormAsyncAction } from '../../states/contacts/saveContact';
import { ContactMetadata } from '../../states/contacts/types';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { selectSavedContacts } from '../../states/case/connectedContacts';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import { selectCurrentDefinitionVersion, selectDefinitionVersions } from '../../states/configuration/selectDefinitions';
import FullTimelineView from './timeline/FullTimelineView';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  handleClose?: () => void;
  onNewCaseSaved?: (caseForm: CaseType) => Promise<void>;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Case: React.FC<Props> = ({
  task,
  counselorsHash,
  removeConnectedCase,
  redirectToNewCase,
  closeModal,
  goBack,
  isCreating,
  handleClose = closeModal,
  routing,
  savedContacts,
  loadContacts,
  releaseContacts,
  updateCaseAsyncAction,
  onNewCaseSaved = () => Promise.resolve(),
  submitContactFormAsyncAction,
  taskContact,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [loadedContactIds, setLoadedContactIds] = useState([]);
  const { connectedCase } = props?.connectedCaseState ?? {};

  const can = React.useMemo(() => {
    return action => getInitializedCan()(action, connectedCase);
  }, [connectedCase]);

  const { workerSid } = getHrmConfig();
  const strings = getTemplateStrings();
  const { enable_case_merging: enableCaseMerging } = getAseloFeatureFlags();

  useEffect(() => {
    if (routing.isCreating && !routing.caseId && taskContact?.caseId) {
      redirectToNewCase(taskContact.caseId);
    }
  });

  useEffect(() => {
    if (!connectedCase) return;
    const connectedContacts = connectedCase.connectedContacts ?? [];
    if (connectedContacts.length) {
      loadContacts(connectedContacts, `case-${connectedCase.id}`);
    }
    setLoadedContactIds(connectedContacts.map(cc => cc.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedCase, task, workerSid]);

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

  const definitionVersion = props.definitionVersions[version];

  if (!props.connectedCaseState || !definitionVersion) return null;

  const getCategories = (firstConnectedContact: Contact): Record<string, string[]> => {
    return firstConnectedContact?.rawJson.categories ?? {};
  };

  const firstConnectedContact = savedContacts && savedContacts[0];

  const categories = getCategories(firstConnectedContact) ?? {};
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const caseCounselor = counselorsHash[twilioWorkerId];
  const currentCounselor = counselorsHash[workerSid];
  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  // -- Converting followUpDate to match the same format as the rest of the dates
  // const followUpPrintedDate = info && info.followUpDate ? getLocaleDateTime(info.followUpDate) : '';
  const followUpPrintedDate = info && info.followUpDate ? parseISO(info.followUpDate).toLocaleDateString() : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];
  const documents = info && info.documents ? info.documents : [];
  const notes = sortActivities(getNoteActivities(info?.counsellorNotes, definitionVersion));
  const childIsAtRisk = Boolean(info && info.childIsAtRisk);
  const referrals = info?.referrals;
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

  const handleSaveAndEnd = async () => {
    setLoading(true);

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      releaseContacts(loadedContactIds, `case-${connectedCase.id}`);
      await updateCaseAsyncAction(connectedCase.id, {
        ...connectedCase,
      });
      closeModal();
      await onNewCaseSaved(connectedCase);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCase = async () => {
    releaseContacts(loadedContactIds, task.taskSid);
    if (!enableCaseMerging && taskContact && isCreating) {
      await removeConnectedCase(taskContact.id);
    }
    handleClose();
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
      counselor: currentCounselor,
      definitionVersion,
    };

    const renderCaseItemPage = (
      sectionApi: CaseSectionApi<unknown>,
      editPermission: typeof PermissionActions[keyof typeof PermissionActions],
      extraAddEditProps: Partial<AddEditCaseItemProps> = {},
    ) => {
      if (isViewCaseSectionRoute(routing)) {
        return <ViewCaseItem {...addScreenProps} sectionApi={sectionApi} canEdit={() => can(editPermission)} />;
      }
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            ...extraAddEditProps,
            sectionApi,
          }}
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
          customFormHandlers: bindFileUploadCustomHandlers(connectedCase.id),
          reactHookFormOptions: {
            shouldUnregister: false,
          },
        });
      case NewCaseSubroutes.CaseSummary:
        return (
          <EditCaseSummary
            {...{
              ...addScreenProps,
              can,
            }}
          />
        );
      default:
      // Fall through to next switch for other routes without actions
    }
  }

  if (routing.subroute === NewCaseSubroutes.CasePrintView) {
    return (
      <CasePrintView
        caseDetails={caseDetails}
        {...{
          counselorsHash,
          onClickClose: goBack,
          definitionVersion,
          task,
        }}
      />
    );
  }

  if (routing.subroute === 'timeline') {
    return <FullTimelineView task={task} />;
  }

  return loading || !definitionVersion ? (
    <CenteredContainer>
      <CircularProgress size={50} />
    </CenteredContainer>
  ) : (
    <CaseHome
      task={task}
      definitionVersion={definitionVersion}
      caseDetails={caseDetails}
      handleClose={handleCloseCase}
      handleUpdate={handleUpdate}
      handleSaveAndEnd={handleSaveAndEnd}
      can={can}
    />
  );
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const caseState = selectCurrentRouteCaseState(state, task.taskSid);
  const { connectedCase } = caseState ?? {};
  const routing = getCurrentTopmostRouteForTask(state[namespace].routing, task.taskSid) as CaseRoute;
  const isCreating = routing.route === 'case' && routing.isCreating;

  return {
    connectedCaseState: caseState,
    connectedCaseId: connectedCase?.id,
    counselorsHash: selectCounselorsHash(state),
    definitionVersions: selectDefinitionVersions(state),
    currentDefinitionVersion: selectCurrentDefinitionVersion(state),
    isCreating,
    routing,
    savedContacts: selectSavedContacts(state, connectedCase),
    taskContact: selectContactByTaskSid(state, task.taskSid)?.savedContact,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => {
  const caseAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  const updateCaseDefinition = (connectedCase: CaseType, taskSid: string, definition) => {
    dispatch(ConfigActions.updateDefinitionVersion(connectedCase.info.definitionVersion, definition));
  };
  return {
    redirectToNewCase: (caseId: string) =>
      dispatch(
        RoutingActions.changeRoute(
          { route: 'case', subroute: 'home', caseId, isCreating: true },
          task.taskSid,
          ChangeRouteMode.Replace,
        ),
      ),
    closeModal: () => dispatch(RoutingActions.newCloseModalAction(task.taskSid)),
    goBack: () => dispatch(RoutingActions.newGoBackAction(task.taskSid)),
    removeConnectedCase: (contactId: string) => caseAsyncDispatch(removeFromCaseAsyncAction(contactId)),
    updateDefinitionVersion: updateCaseDefinition,
    releaseContacts: bindActionCreators(ContactActions.releaseContacts, dispatch),
    loadContacts: bindActionCreators(ContactActions.loadContacts, dispatch),
    updateCaseAsyncAction: (caseId: CaseType['id'], body: Partial<CaseType>) =>
      caseAsyncDispatch(updateCaseAsyncAction(caseId, body)),
    submitContactFormAsyncAction: (
      task: CustomITask,
      contact: Contact,
      metadata: ContactMetadata,
      caseForm: CaseType,
    ) => caseAsyncDispatch(submitContactFormAsyncAction(task, contact, metadata, caseForm)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
