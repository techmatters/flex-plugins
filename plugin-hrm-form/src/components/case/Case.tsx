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
import { getInitializedCan } from '../../permissions';
import { CenteredContainer } from './styles';
import EditCaseOverview from './caseOverview/EditCaseOverview';
import * as ContactActions from '../../states/contacts/existingContacts';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { selectCurrentDefinitionVersion, selectDefinitionVersions } from '../../states/configuration/selectDefinitions';
import FullTimelineView from './timeline/FullTimelineView';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import selectContextContactId from '../../states/contacts/selectContextContactId';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { useCase } from '../../states/case/hooks/useCase';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  handleClose?: () => void;
  onNewCaseSaved?: (savedCase: CaseType) => Promise<void>;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Case: React.FC<Props> = ({
  task,
  connectedCaseId,
  counselorsHash,
  removeConnectedCase,
  redirectToNewCase,
  closeModal,
  handleClose = closeModal,
  routing,
  // loadCase,
  loadContacts,
  releaseAllContacts,
  openPrintModal,
  onNewCaseSaved = () => Promise.resolve(),
  contextContact,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const { connectedCase, loading: loadingCase } = useCase({
    caseId: connectedCaseId,
    referenceId: `case-details-${task.taskSid}`,
    refresh: true, // force a reload
  });

  const can = React.useMemo(() => {
    return action => getInitializedCan()(action, connectedCase);
  }, [connectedCase]);

  const { workerSid } = getHrmConfig();
  const strings = getTemplateStrings();

  useEffect(() => {
    if (routing.isCreating && !routing.caseId && contextContact?.caseId) {
      redirectToNewCase(contextContact.caseId);
    }
  });

  const version = connectedCase?.info.definitionVersion;
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

  if (loading || loadingCase) {
    return (
      <CenteredContainer>
        <CircularProgress size={50} />
      </CenteredContainer>
    );
  }

  if (!connectedCase || !definitionVersion) return null;

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
    releaseAllContacts(`case-${connectedCase.id}`);
    handleClose();
  };

  if (isAddCaseSectionRoute(routing) || isViewCaseSectionRoute(routing) || isEditCaseSectionRoute(routing)) {
    const { subroute } = routing;

    const addScreenProps = {
      task,
      counselor: currentCounselor,
      definitionVersion,
    };

    const renderCaseItemPage = (sectionTypeName, extraAddEditProps: Partial<AddEditCaseItemProps> = {}) => {
      if (isViewCaseSectionRoute(routing)) {
        return <ViewCaseItem {...addScreenProps} sectionTypeName={sectionTypeName} />;
      }
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            ...extraAddEditProps,
            sectionTypeName,
          }}
        />
      );
    };
    if (subroute.startsWith('section/')) {
      const [, sectionTypeName] = subroute.split('/');

      return renderCaseItemPage(sectionTypeName, {
        customFormHandlers: bindFileUploadCustomHandlers(connectedCase.id),
        reactHookFormOptions: {
          shouldUnregister: false,
        },
      });
    }
    if (subroute === NewCaseSubroutes.CaseOverview) {
      return (
        <EditCaseOverview
          {...{
            ...addScreenProps,
            can,
          }}
        />
      );
    }
  }

  if (routing.subroute === NewCaseSubroutes.CasePrintView) {
    return <CasePrintView task={task} />;
  }

  if (routing.subroute === 'timeline') {
    return <FullTimelineView task={task} />;
  }

  return (
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
  const contactId = selectContextContactId(state, task.taskSid, 'case', 'home');

  return {
    connectedCaseId,
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
    removeConnectedCase: (contactId: string) => caseAsyncDispatch(removeFromCaseAsyncAction(contactId)),
    updateDefinitionVersion: updateCaseDefinition,
    releaseAllContacts: bindActionCreators(ContactActions.releaseAllContacts, dispatch),
    loadContacts: bindActionCreators(ContactActions.loadContacts, dispatch),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
