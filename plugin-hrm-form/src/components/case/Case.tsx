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

import { RootState } from '../../states';
import { getDefinitionVersion } from '../../services/ServerlessService';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import { Case as CaseType, CustomITask, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import {
  CaseRoute,
  ChangeRouteMode,
  isAddCaseSectionRoute,
  isCaseRoute,
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
import { getAseloFeatureFlags, getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import { selectCurrentDefinitionVersion, selectDefinitionVersions } from '../../states/configuration/selectDefinitions';
import FullTimelineView from './timeline/FullTimelineView';
import { updateCaseOverviewAsyncAction } from '../../states/case/saveCase';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import { CaseStateEntry } from '../../states/case/types';
import selectContextContactId from '../../states/contacts/selectContextContactId';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  handleClose?: () => void;
  onNewCaseSaved?: (caseState: CaseStateEntry) => Promise<void>;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Case: React.FC<Props> = ({
  task,
  connectedCaseId,
  connectedCaseState,
  counselorsHash,
  removeConnectedCase,
  redirectToNewCase,
  closeModal,
  goBack,
  handleClose = closeModal,
  routing,
  loadCase,
  loadContacts,
  releaseAllContacts,
  openPrintModal,
  onNewCaseSaved = () => Promise.resolve(),
  contextContact,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const { connectedCase } = connectedCaseState ?? {};

  const can = React.useMemo(() => {
    return action => getInitializedCan()(action, connectedCase);
  }, [connectedCase]);

  const { workerSid } = getHrmConfig();
  const strings = getTemplateStrings();
  const { enable_case_merging: enableCaseMerging } = getAseloFeatureFlags();

  useEffect(() => {
    if (routing.isCreating && !routing.caseId && contextContact?.caseId) {
      redirectToNewCase(contextContact.caseId);
    }
  });

  useEffect(() => {
    if (!connectedCase && connectedCaseId) {
      loadCase(connectedCaseId);
    }
  }, [connectedCase, connectedCaseId, loadCase]);

  const version = connectedCaseState?.connectedCase.info.definitionVersion;
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

  if (!connectedCaseState || !definitionVersion) return null;

  const currentCounselor = counselorsHash[workerSid];

  const handlePrintCase = () => {
    openPrintModal(connectedCase.id);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    try {
      releaseAllContacts(`case-${connectedCase.id}`);
      closeModal();
      // Validating that task isn't a StandaloneITask.
      if (isStandaloneITask(task)) return;
      await onNewCaseSaved(connectedCaseState);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCase = async () => {
    releaseAllContacts(`case-${connectedCase.id}`);
    if (!enableCaseMerging && contextContact && contextContact.caseId === connectedCaseId) {
      await removeConnectedCase(contextContact.id);
    }
    handleClose();
  };

  if (isAddCaseSectionRoute(routing) || isViewCaseSectionRoute(routing) || isEditCaseSectionRoute(routing)) {
    const { subroute } = routing;

    const addScreenProps = {
      task,
      counselor: currentCounselor,
      definitionVersion,
    };

    const renderCaseItemPage = (
      sectionApi: CaseSectionApi,
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
    return <CasePrintView task={task} />;
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
      handleClose={handleCloseCase}
      handleSaveAndEnd={handleSaveAndEnd}
      handlePrintCase={handlePrintCase}
      can={can}
    />
  );
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);
  const connectedCaseId = isCaseRoute(currentRoute) ? currentRoute.caseId : undefined;
  const caseState = selectCurrentRouteCaseState(state, task.taskSid);
  const contactId = selectContextContactId(state, task.taskSid, 'case', 'home');

  return {
    connectedCaseId,
    connectedCaseState: caseState,
    counselorsHash: selectCounselorsHash(state),
    definitionVersions: selectDefinitionVersions(state),
    currentDefinitionVersion: selectCurrentDefinitionVersion(state),
    routing: currentRoute as CaseRoute,
    contextContact: selectContactStateByContactId(state, contactId)?.savedContact,
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
    openPrintModal: (caseId: CaseType['id']) => {
      dispatch(RoutingActions.newOpenModalAction({ route: 'case', subroute: 'case-print-view', caseId }, task.taskSid));
    },
    goBack: () => dispatch(RoutingActions.newGoBackAction(task.taskSid)),
    removeConnectedCase: (contactId: string) => caseAsyncDispatch(removeFromCaseAsyncAction(contactId)),
    updateDefinitionVersion: updateCaseDefinition,
    releaseAllContacts: bindActionCreators(ContactActions.releaseAllContacts, dispatch),
    loadContacts: bindActionCreators(ContactActions.loadContacts, dispatch),
    loadCase: (caseId: CaseType['id']) => dispatch(updateCaseOverviewAsyncAction(caseId)), // Empty update loads case into state
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
