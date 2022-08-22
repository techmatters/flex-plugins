/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer } from '../../styles/case';
import { BottomButtonBar, Box, StyledNextStepButton, FormOption } from '../../styles/HrmStyles';
import CaseDetailsComponent from './CaseDetails';
import Timeline from './Timeline';
import CaseSection from './CaseSection';
import { PermissionActions } from '../../permissions';
import {
  AppRoutes,
  CaseItemAction,
  CaseSectionSubroute,
  NewCaseSubroutes,
  AppRoutesWithCaseAndAction,
} from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { contactFormsBase, namespace, RootState, routingBase, connectedCaseBase } from '../../states';
import {
  Activity,
  CaseDetails,
  CaseDetailsName,
  EditTemporaryCaseInfo,
  isEditTemporaryCaseInfo,
  TemporaryCaseInfo,
  ViewTemporaryCaseInfo,
} from '../../states/case/types';
import { CustomITask, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
import * as CaseActions from '../../states/case/actions';
import { getConfig } from '../../HrmFormPlugin';
import InformationRow from './InformationRow';
import TimelineInformationRow from './TimelineInformationRow';
import DocumentInformationRow from './DocumentInformationRow';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseState } from '../../states/case/reducer';
import { incidentSectionApi } from '../../states/case/sections/incident';
import { householdSectionApi } from '../../states/case/sections/household';
import { perpetratorSectionApi } from '../../states/case/sections/perpetrator';
import { documentSectionApi } from '../../states/case/sections/document';

const splitFullName = (name: CaseDetailsName) => {
  if (name.firstName === 'Unknown' && name.lastName === 'Unknown') {
    return 'Unknown';
  }
  return `${name.firstName} ${name.lastName}`;
};

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  caseDetails: CaseDetails;
  timeline: Activity[];
  isCreating?: boolean;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  handleCancelNewCaseAndClose: () => void;
  handleUpdate: () => void;
  onInfoChange: (field: string, value: string | boolean) => void;
  onStatusChange: (value: string | boolean) => void;
  can: (action: string) => boolean;
  isEdited?: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = CaseHomeProps & ConnectedProps<typeof connector>;

const CaseHome: React.FC<Props> = ({
  definitionVersion,
  task,
  form,
  routing,
  updateTempInfo,
  changeRoute,
  isCreating,
  isEdited,
  handleClose,
  handleSaveAndEnd,
  handleCancelNewCaseAndClose,
  handleUpdate,
  onInfoChange,
  timeline,
  caseDetails,
  can,
  temporaryCaseInfo,
  connectedCaseState,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [closeDialog, setCloseDialog] = useState(false);

  const { featureFlags } = getConfig();
  const { connectedCase } = connectedCaseState;
  const summary = connectedCase.info?.summary || '';

  if (routing.route === 'csam-report') return null; // narrow type before deconstructing
  const { route } = routing;

  type CaseItemInfo<T extends TemporaryCaseInfo> = T['info']; // A bit redundant but looks cleaner than the anonymous subtype reference syntax

  const onCaseItemActionClick = <T extends ViewTemporaryCaseInfo>(
    targetSubroute: CaseSectionSubroute,
    targetAction: T['action'],
  ): ((entry: CaseItemInfo<T>) => void) => (entry: CaseItemInfo<T>) => {
    updateTempInfo({ screen: targetSubroute, info: entry, action: targetAction }, task.taskSid);
    changeRoute({ route, subroute: targetSubroute, action: targetAction } as AppRoutes, task.taskSid);
  };

  const onAddCaseItemClick = (targetSubroute: CaseSectionSubroute) => () => {
    updateTempInfo({ screen: targetSubroute, action: CaseItemAction.Add, info: null }, task.taskSid);
    changeRoute({ route, subroute: targetSubroute, action: CaseItemAction.Add } as AppRoutes, task.taskSid);
  };

  const onPrintCase = () => {
    changeRoute({ route, subroute: 'case-print-view' }, task.taskSid);
  };

  const onClickChildIsAtRisk = () => {
    onInfoChange('childIsAtRisk', !caseDetails.childIsAtRisk);
  };

  const onCloseDialogSave = () => {
    try {
      handleUpdate();
    } finally {
      if (closeDialog === true) {
        setCloseDialog(false);
        handleClose();
      }
    }
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
    name,
    categories,
    contact,
    createdAt,
    updatedAt,
    childIsAtRisk,
    caseCounselor,
    status,
    followUpDate,
    version,
  } = caseDetails;
  const fullName = splitFullName(name);

  const itemRowRenderer = <TViewCaseInfo extends ViewTemporaryCaseInfo>(
    itemTypeName: string,
    viewSubroute: CaseSectionSubroute,
    items: CaseItemInfo<TViewCaseInfo>[],
  ) => {
    const itemRows = () => {
      return items.length ? (
        <>
          {items.map((item, index) => (
            <InformationRow
              key={`${itemTypeName}-${index}`}
              person={item[itemTypeName]}
              onClickView={() => onCaseItemActionClick<TViewCaseInfo>(viewSubroute, CaseItemAction.View)(item)}
            />
          ))}
        </>
      ) : null;
    };
    itemRows.displayName = `${name}Rows`;
    return itemRows;
  };

  const householdRows = itemRowRenderer<ViewTemporaryCaseInfo>(
    'form',
    NewCaseSubroutes.Household,
    households.map((h, index) => {
      return { ...householdSectionApi.toForm(h), index };
    }),
  );

  const perpetratorRows = itemRowRenderer<ViewTemporaryCaseInfo>(
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
              onClickView={() =>
                onCaseItemActionClick<ViewTemporaryCaseInfo>(
                  NewCaseSubroutes.Incident,
                  CaseItemAction.View,
                )(incidentSectionApi.toForm(item))
              }
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
              onClickView={() =>
                onCaseItemActionClick<ViewTemporaryCaseInfo>(
                  NewCaseSubroutes.Document,
                  CaseItemAction.View,
                )(documentSectionApi.toForm(item))
              }
            />
          );
        })}
      </>
    ) : null;
  };

  const onEditCaseItemClick = (targetSubroute: CaseSectionSubroute) => {
    const summaryCaseInfo: EditTemporaryCaseInfo = {
      action: CaseItemAction.Edit,
      info: {
        createdAt: connectedCase.createdAt,
        updatedAt: connectedCase.updatedAt,
        updatedBy: connectedCase.twilioWorkerId,
        form: {
          caseStatus: status,
          date: followUpDate,
          inImminentPhysicalDanger: childIsAtRisk === undefined ? false : childIsAtRisk,
          caseSummary: summary,
        },
        id: null,
        twilioWorkerId: connectedCase.twilioWorkerId,
      },
      screen: 'caseSummary',
    };
    temporaryCaseInfo = summaryCaseInfo;
    if (isEditTemporaryCaseInfo(temporaryCaseInfo)) {
      updateTempInfo(
        { screen: temporaryCaseInfo.screen, action: CaseItemAction.Edit, info: temporaryCaseInfo.info },
        task.taskSid,
      );
    }
    changeRoute({ ...routing, subroute: targetSubroute, action: CaseItemAction.Edit } as AppRoutes, task.taskSid);
  };

  return (
    <>
      <CaseContainer data-testid="CaseHome-CaseDetailsComponent">
        <Box marginLeft="25px" marginTop="13px">
          <CaseDetailsComponent
            caseId={id}
            name={fullName}
            status={status}
            can={can}
            counselor={caseCounselor}
            categories={categories}
            createdAt={createdAt}
            updatedAt={updatedAt}
            followUpDate={followUpDate}
            childIsAtRisk={childIsAtRisk}
            office={office?.label}
            handlePrintCase={onPrintCase}
            definitionVersion={definitionVersion}
            definitionVersionName={version}
            isOrphanedCase={!contact}
            editCaseSummary={() => onEditCaseItemClick(NewCaseSubroutes.CaseSummary)}
          />
        </Box>
        <Box margin="25px 25px 0 25px">
          <CaseSummary task={task} readonly={true} />
        </Box>
        <Box margin="0 25px">
          <Timeline
            timelineActivities={timeline}
            contacts={caseDetails.contacts}
            taskSid={task.taskSid}
            form={form}
            can={can}
            route={route}
          />
        </Box>
        <Box margin="25px 25px 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_HOUSEHOLD)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Household)}
            sectionTypeId="Household"
          >
            {householdRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 25px 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_PERPETRATOR)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Perpetrator)}
            sectionTypeId="Perpetrator"
          >
            {perpetratorRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 25px 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_INCIDENT)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Incident)}
            sectionTypeId="Incident"
          >
            {incidentRows()}
          </CaseSection>
        </Box>
        {featureFlags.enable_upload_documents && (
          <Box margin="25px">
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
      <BottomButtonBar>
        {isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="CaseHome-CancelButton"
                secondary
                roundCorners
                onClick={handleCancelNewCaseAndClose}
              >
                <Template code="BottomBar-CancelNewCaseAndClose" />
              </StyledNextStepButton>
            </Box>
            <StyledNextStepButton roundCorners onClick={handleSaveAndEnd} data-testid="BottomBar-SaveCaseAndEnd">
              <Template code="BottomBar-SaveAndEnd" />
            </StyledNextStepButton>
          </>
        )}
        {!isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="CaseHome-CloseButton"
                secondary
                roundCorners
                onClick={isEdited === true ? () => setCloseDialog(true) : handleClose}
              >
                <Template code="BottomBar-Close" />
              </StyledNextStepButton>
              <CloseCaseDialog
                setDialog={() => setCloseDialog(false)}
                handleDontSaveClose={handleClose}
                handleSaveUpdate={onCloseDialogSave}
                openDialog={closeDialog}
              />
            </Box>
          </>
        )}
      </BottomButtonBar>
    </>
  );
};

CaseHome.displayName = 'CaseHome';

const mapStateToProps = (state: RootState, ownProps: CaseHomeProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const routing = state[namespace][routingBase].tasks[ownProps.task.taskSid];
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { form, routing, temporaryCaseInfo, connectedCaseState };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseHome);

export default connected;
