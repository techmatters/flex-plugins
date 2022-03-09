/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AddIcon from '@material-ui/icons/Add';
import { Template } from '@twilio/flex-ui';
import CancelIcon from '@material-ui/icons/Cancel';
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer } from '../../styles/case';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import CaseDetailsComponent from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import Timeline from './Timeline';
import CaseSection from './CaseSection';
import { PermissionActions } from '../../permissions';
import { AppRoutes, CaseItemAction, CaseSectionSubroute, NewCaseSubroutes } from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { contactFormsBase, namespace, RootState, routingBase } from '../../states';
import {
  Activity,
  CaseDetails,
  CaseDetailsName,
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
  onStatusChange,
  timeline,
  caseDetails,
  can,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [mockedMessage, setMockedMessage] = useState(null);
  const { featureFlags } = getConfig();

  if (routing.route === 'csam-report') return null; // narrow type before deconstructing
  const { route } = routing;

  const isMockedMessageOpen = Boolean(mockedMessage);

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

  const toggleCaseMenu = e => {
    e.persist();
    setAnchorEl(e.currentTarget || e.target);
    setMenuOpen(!isMenuOpen);
  };

  const handleMockedMessage = () => {
    setMockedMessage(<Template code="NotImplemented" />);
    setMenuOpen(false);
  };

  const closeMockedMessage = () => setMockedMessage(null);

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
    openedDate,
    lastUpdatedDate,
    childIsAtRisk,
    caseCounselor,
    status,
    prevStatus,
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
      const { household, ...caseInfoItem } = { ...h, form: h.household, id: null };
      return { ...caseInfoItem, index };
    }),
  );

  const perpetratorRows = itemRowRenderer<ViewTemporaryCaseInfo>(
    'form',
    NewCaseSubroutes.Perpetrator,
    perpetrators.map((p, index) => {
      const { perpetrator, ...caseInfoItem } = { ...p, form: p.perpetrator, id: null };
      return { ...caseInfoItem, index };
    }),
  );

  const incidentRows = () => {
    return incidents.length ? (
      <>
        {incidents.map((item, index) => {
          const { incident, ...caseItemEntry } = { ...item, form: item.incident, id: null };
          return (
            <TimelineInformationRow
              key={`incident-${index}`}
              onClickView={() =>
                onCaseItemActionClick<ViewTemporaryCaseInfo>(
                  NewCaseSubroutes.Incident,
                  CaseItemAction.View,
                )({ ...caseItemEntry, index })
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
          const { document, ...caseItemEntry } = { ...item, form: item.document, index };
          return (
            <DocumentInformationRow
              key={`document-${index}`}
              documentEntry={item}
              onClickView={() =>
                onCaseItemActionClick<ViewTemporaryCaseInfo>(
                  NewCaseSubroutes.Document,
                  CaseItemAction.View,
                )(caseItemEntry)
              }
            />
          );
        })}
      </>
    ) : null;
  };

  return (
    <>
      <CaseContainer>
        <Box marginLeft="25px" marginTop="13px">
          <CaseDetailsComponent
            caseId={id}
            name={fullName}
            status={status}
            prevStatus={prevStatus}
            can={can}
            counselor={caseCounselor}
            categories={categories}
            openedDate={openedDate}
            lastUpdatedDate={lastUpdatedDate}
            followUpDate={followUpDate}
            childIsAtRisk={childIsAtRisk}
            office={office?.label}
            handlePrintCase={onPrintCase}
            handleInfoChange={onInfoChange}
            handleStatusChange={onStatusChange}
            handleClickChildIsAtRisk={onClickChildIsAtRisk}
            definitionVersion={definitionVersion}
            definitionVersionName={version}
            isOrphanedCase={!contact}
          />
        </Box>
        <Box marginLeft="25px" marginTop="25px">
          <Timeline
            timelineActivities={timeline}
            contacts={caseDetails.contacts}
            taskSid={task.taskSid}
            form={form}
            can={can}
            route={route}
          />
        </Box>
        <Box marginLeft="25px" marginTop="25px">
          <CaseSection
            can={() => can(PermissionActions.ADD_HOUSEHOLD)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Household)}
            sectionTypeId="Household"
          >
            {householdRows()}
          </CaseSection>
        </Box>
        <Box marginLeft="25px" marginTop="25px">
          <CaseSection
            can={() => can(PermissionActions.ADD_PERPETRATOR)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Perpetrator)}
            sectionTypeId="Perpetrator"
          >
            {perpetratorRows()}
          </CaseSection>
        </Box>
        <Box marginLeft="25px" marginTop="25px">
          <CaseSection
            can={() => can(PermissionActions.ADD_INCIDENT)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Incident)}
            sectionTypeId="Incident"
          >
            {incidentRows()}
          </CaseSection>
        </Box>
        {featureFlags.enable_upload_documents && (
          <Box marginLeft="25px" marginTop="25px">
            <CaseSection
              onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Document)}
              can={() => can(PermissionActions.ADD_DOCUMENT)}
              sectionTypeId="Document"
            >
              {documentRows()}
            </CaseSection>
          </Box>
        )}
        <Box marginLeft="25px" marginTop="25px">
          <CaseSummary task={task} readonly={!can(PermissionActions.EDIT_CASE_SUMMARY)} />
        </Box>
        <Dialog onClose={closeMockedMessage} open={isMockedMessageOpen}>
          <DialogContent>{mockedMessage}</DialogContent>
        </Dialog>
        <Menu
          data-testid="CaseHome-CancelMenu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClickAway={() => setMenuOpen(false)}
        >
          <MenuItem
            Icon={AddIcon}
            text={<Template code="BottomBar-AddThisContactToExistingCase" />}
            onClick={handleMockedMessage}
          />
          <MenuItem
            red
            Icon={CancelIcon}
            text={<Template code="BottomBar-CancelNewCaseAndClose" />}
            onClick={handleCancelNewCaseAndClose}
          />
        </Menu>
      </CaseContainer>
      <BottomButtonBar>
        {isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton data-testid="CaseHome-CancelButton" secondary roundCorners onClick={toggleCaseMenu}>
                <Template code="BottomBar-Cancel" />
              </StyledNextStepButton>
            </Box>
            <StyledNextStepButton roundCorners onClick={handleSaveAndEnd}>
              <Template code="BottomBar-SaveAndEnd" />
            </StyledNextStepButton>
          </>
        )}
        {!isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton secondary roundCorners onClick={handleClose} data-testid="CaseHome-CloseButton">
                <Template code="BottomBar-Close" />
              </StyledNextStepButton>
            </Box>
            <StyledNextStepButton disabled={!isEdited} roundCorners onClick={handleUpdate}>
              <Template code="BottomBar-Update" />
            </StyledNextStepButton>
          </>
        )}
      </BottomButtonBar>
    </>
  );
};

CaseHome.displayName = 'CaseHome';

const mapStateToProps = (state: RootState, ownProps: CaseHomeProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
});

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
  updateTempInfo: CaseActions.updateTempInfo,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseHome);

export default connected;
