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

/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer } from '../../styles/case';
import { BottomButtonBar, Box, Flex, StyledNextStepButton } from '../../styles/HrmStyles';
import CaseDetailsComponent from './CaseDetails';
import Timeline from './Timeline';
import CaseSection from './CaseSection';
import {
  getPermissionsForCase,
  getPermissionsForContact,
  PermissionActions,
  PermissionActionType,
} from '../../permissions';
import { AppRoutes, CaseItemAction, CaseSectionSubroute, NewCaseSubroutes } from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { RootState } from '../../states';
import { CaseDetails, CaseState } from '../../states/case/types';
import { Case, Contact, CustomITask, EntryInfo, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
import InformationRow from './InformationRow';
import TimelineInformationRow from './TimelineInformationRow';
import DocumentInformationRow from './DocumentInformationRow';
import { householdSectionApi } from '../../states/case/sections/household';
import { perpetratorSectionApi } from '../../states/case/sections/perpetrator';
import { getAseloFeatureFlags } from '../../hrmConfig';
import { connectedCaseBase, namespace } from '../../states/storeNamespaces';
import NavigableContainer from '../NavigableContainer';
import ConnectToCaseButton from './ConnectToCaseButton';
import { isStandaloneITask } from './Case';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import asyncDispatch from '../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import { newCloseModalAction } from '../../states/routing/actions';
import { BannerContainer, Text } from '../caseMergingBanners/styles';
import InfoIcon from '../caseMergingBanners/InfoIcon';

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  caseDetails: CaseDetails;
  isCreating?: boolean;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  handleUpdate: () => void;
  can: (action: PermissionActionType) => boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = CaseHomeProps & ConnectedProps<typeof connector>;

const CaseHome: React.FC<Props> = ({
  definitionVersion,
  task,
  openModal,
  closeModal,
  connectCaseToTaskContact,
  isCreating,
  handleClose,
  handleSaveAndEnd,
  caseDetails,
  can,
  connectedCaseState,
  taskContact,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  if (!connectedCaseState) return null; // narrow type before deconstructing

  const featureFlags = getAseloFeatureFlags();

  const onViewCaseItemClick = (targetSubroute: CaseSectionSubroute) => (id: string) => {
    openModal({ route: 'case', subroute: targetSubroute, action: CaseItemAction.View, id });
  };

  const onAddCaseItemClick = (targetSubroute: CaseSectionSubroute) => () => {
    openModal({ route: 'case', subroute: targetSubroute, action: CaseItemAction.Add });
  };

  const onPrintCase = () => {
    openModal({ route: 'case', subroute: 'case-print-view' });
  };

  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const {
    incidents,
    perpetrators,
    households,
    documents,
    office,
    id,
    contactIdentifier,
    categories,
    contact,
    createdAt,
    updatedAt,
    childIsAtRisk,
    caseCounselor,
    status,
    followUpDate,
  } = caseDetails;
  const statusLabel = definitionVersion.caseStatus[status]?.label ?? status;
  const isConnectedToTaskContact = taskContact && taskContact.caseId === id;

  const { connectedCase } = connectedCaseState;

  const { can: canForCase } = getPermissionsForCase(connectedCase.twilioWorkerId, connectedCase.status);
  const { can: canForContact } = getPermissionsForContact(taskContact?.twilioWorkerId);

  const showConnectToCaseButton = Boolean(
    taskContact &&
      !isConnectedToTaskContact &&
      canForCase(PermissionActions.UPDATE_CASE_CONTACTS) &&
      canForContact(PermissionActions.ADD_CONTACT_TO_CASE),
  );

  const itemRowRenderer = (itemTypeName: string, viewSubroute: CaseSectionSubroute, items: EntryInfo[]) => {
    const itemRows = () => {
      return items.length ? (
        <>
          {items.map((item, index) => (
            <InformationRow
              key={`${itemTypeName}-${index}`}
              person={item[itemTypeName]}
              onClickView={() => onViewCaseItemClick(viewSubroute)(item.id)}
            />
          ))}
        </>
      ) : null;
    };
    itemRows.displayName = `${name}Rows`;
    return itemRows;
  };

  const householdRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Household,
    households.map((h, index) => {
      return { ...householdSectionApi.toForm(h), index };
    }),
  );

  const perpetratorRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Perpetrator,
    perpetrators.map((p, index) => {
      return { ...perpetratorSectionApi.toForm(p), index };
    }),
  );

  const incidentRows = () => {
    return incidents.length ? (
      <>
        {incidents.map((item, index) => {
          return (
            <TimelineInformationRow
              key={`incident-${index}`}
              onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Incident)(item.id)}
              definition={caseForms.IncidentForm}
              values={item.incident}
              layoutDefinition={caseLayouts.incidents}
            />
          );
        })}
      </>
    ) : null;
  };

  const documentRows = () => {
    return documents.length ? (
      <>
        {documents.map((item, index) => {
          return (
            <DocumentInformationRow
              key={`document-${index}`}
              documentEntry={item}
              onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Document)(item.id)}
            />
          );
        })}
      </>
    ) : null;
  };

  const onEditCaseSummaryClick = () => {
    openModal({ route: 'case', subroute: 'caseSummary', action: CaseItemAction.Edit, id: '' });
  };

  return (
    <NavigableContainer titleCode={contactIdentifier} task={task} onGoBack={handleClose} onCloseModal={handleClose}>
      <CaseContainer data-testid="CaseHome-CaseDetailsComponent">
        {showConnectToCaseButton && (
          <BannerContainer color="yellow" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
            <Flex width="100%" justifyContent="space-between">
              <Flex alignItems="center">
                <InfoIcon color="#fed44b" />
                <Text>
                  <Template code="CaseMerging-AddContactToCase" />
                </Text>
              </Flex>
              <ConnectToCaseButton
                isConnectedToTaskContact={isConnectedToTaskContact}
                onClickConnectToTaskContact={() => {
                  connectCaseToTaskContact(taskContact, connectedCaseState.connectedCase);
                  closeModal();
                }}
                color="black"
              />
            </Flex>
          </BannerContainer>
        )}
        <Box marginLeft="25px" marginTop="13px">
          <CaseDetailsComponent
            caseId={id.toString()}
            statusLabel={statusLabel}
            can={can}
            counselor={caseCounselor}
            categories={categories}
            createdAt={createdAt}
            updatedAt={updatedAt}
            followUpDate={followUpDate}
            childIsAtRisk={childIsAtRisk}
            availableStatusTransitions={connectedCaseState.availableStatusTransitions}
            office={office?.label}
            handlePrintCase={onPrintCase}
            definitionVersion={definitionVersion}
            isOrphanedCase={!contact}
            editCaseSummary={onEditCaseSummaryClick}
          />
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSummary task={task} />
        </Box>
        <Box margin="25px 0 0 25px">
          <Timeline taskSid={task.taskSid} can={can} />
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_HOUSEHOLD)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Household)}
            sectionTypeId="Household"
          >
            {householdRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_PERPETRATOR)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Perpetrator)}
            sectionTypeId="Perpetrator"
          >
            {perpetratorRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_INCIDENT)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Incident)}
            sectionTypeId="Incident"
          >
            {incidentRows()}
          </CaseSection>
        </Box>
        {featureFlags.enable_upload_documents && (
          <Box margin="25px 0 0 25px">
            <CaseSection
              onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Document)}
              canAdd={() => can(PermissionActions.ADD_DOCUMENT)}
              sectionTypeId="Document"
            >
              {documentRows()}
            </CaseSection>
          </Box>
        )}
      </CaseContainer>
      {isCreating && (
        <BottomButtonBar>
          <>
            <StyledNextStepButton roundCorners onClick={handleSaveAndEnd} data-testid="BottomBar-SaveCaseAndEnd">
              <Template code="BottomBar-SaveAndEnd" />
            </StyledNextStepButton>
          </>
        </BottomButtonBar>
      )}
    </NavigableContainer>
  );
};

CaseHome.displayName = 'CaseHome';

const mapStateToProps = (state: RootState, { task }: CaseHomeProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[task.taskSid];
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  return { connectedCaseState, taskContact };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: CaseHomeProps) => ({
  changeRoute: (route: AppRoutes) => dispatch(RoutingActions.changeRoute(route, task.taskSid)),
  openModal: (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid)),
  connectCaseToTaskContact: async (taskContact: Contact, cas: Case) =>
    asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, cas.id)),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
});
const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseHome);

export default connected;
