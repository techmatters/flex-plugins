/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { format } from 'date-fns';

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
import { cancelCase, getActivities, updateCase } from '../../services/CaseService';
import { completeTask, submitContactForm } from '../../services/formSubmissionHelpers';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getDateFromNotSavedContact, getHelplineData, isConnectedCaseActivity, sortActivities } from './caseHelpers';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseContainer, CenteredContainer } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import { getLocaleDateTime } from '../../utils/helpers';
import * as SearchActions from '../../states/search/actions';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import Timeline from './Timeline';
import CaseSummary from './CaseSummary';
import ViewContact from './ViewContact';
import {
  CaseDetailsName,
  EditTemporaryCaseInfo,
  TemporaryCaseInfo,
  updateCaseListByIndex,
  updateCaseSectionListByIndex,
  ViewTemporaryCaseInfo,
} from '../../states/case/types';
import { Case as CaseType, CustomITask, NoteEntry, ReferralEntry, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { recordBackendError } from '../../fullStory';
import { AppRoutes, AppRoutesWithCase, NewCaseSubroutes } from '../../states/routing/types';
import CaseSection from './CaseSection';
import InformationRow from './InformationRow';
import TimelineInformationRow from './TimelineInformationRow';
import DocumentInformationRow from './DocumentInformationRow';
import AddEditCaseItem from './AddEditCaseItem';
import ViewCaseItem from './ViewCaseItem';
import documentUploadHandler from './documentUploadHandler';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  isCreating?: boolean;
  handleClose?: () => void;
  updateAllCasesView?: (updatedCase: CaseType) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const getFirstNameAndLastNameFromContact = (contact): CaseDetailsName => {
  if (contact?.rawJson?.childInformation?.name) {
    const { firstName, lastName } = contact.rawJson.childInformation.name;
    return {
      firstName,
      lastName,
    };
  }
  return {
    firstName: 'Unknown',
    lastName: 'Unknown',
  };
};

const getFirstNameAndLastNameFromForm = (form): CaseDetailsName => {
  if (form?.childInformation) {
    const { firstName, lastName } = form.childInformation;
    return {
      firstName,
      lastName,
    };
  }
  return {
    firstName: 'Unknown',
    lastName: 'Unknown',
  };
};

const splitFullName = (name: CaseDetailsName) => {
  if (name.firstName === 'Unknown' && name.lastName === 'Unknown') {
    return 'Unknown';
  }
  return `${name.firstName} ${name.lastName}`;
};

const Case: React.FC<Props> = props => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [mockedMessage, setMockedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    /**
     * Gets the activities timeline from current caseId
     * If the case is just being created, adds the case's description as a new activity.
     */
    const getTimeline = async () => {
      if (!props.connectedCaseId) return;

      setLoading(true);
      const activities = await getActivities(props.connectedCaseId);
      setLoading(false);
      let timelineActivities = sortActivities(activities);

      const isCreatingCase = !timelineActivities.some(isConnectedCaseActivity);

      if (isCreatingCase) {
        if (isStandaloneITask(props.task)) return;
        const date = getDateFromNotSavedContact(props.task, props.form);
        const { workerSid } = getConfig();
        const connectCaseActivity = {
          date: format(date, 'yyyy-MM-dd HH:mm:ss'),
          createdAt: new Date().toISOString(),
          type: props.task.channelType,
          text: props.form.caseInformation.callSummary.toString(),
          twilioWorkerId: workerSid,
          channel:
            props.task.channelType === 'default'
              ? props.form.contactlessTask.channel.toString()
              : props.task.channelType,
        };

        timelineActivities = sortActivities([...timelineActivities, connectCaseActivity]);
      }
      setTimeline(timelineActivities);
    };

    getTimeline();
  }, [
    props.task,
    props.form,
    props.connectedCaseId,
    props.connectedCaseNotes,
    props.connectedCaseReferrals,
    setLoading,
  ]);

  const version = props.connectedCaseState?.connectedCase.info.definitionVersion;
  const { updateDefinitionVersion, definitionVersions } = props;

  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
    }
  }, [definitionVersions, updateDefinitionVersion, version]);

  // Memoize can function so is not re-created on every render of Case, but only when relevant case info changes
  const { can } = React.useMemo(
    () =>
      getPermissionsForCase(
        props.connectedCaseState?.connectedCase.twilioWorkerId,
        props.connectedCaseState?.prevStatus,
      ),
    [props.connectedCaseState?.connectedCase.twilioWorkerId, props.connectedCaseState?.prevStatus],
  );

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

  const handleCancelNewCaseAndClose = async () => {
    const { task } = props;
    const { connectedCase } = props.connectedCaseState;
    await cancelCase(connectedCase.id);

    props.changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation', autoFocus: true }, task.taskSid);
    props.removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { task, form } = props;
    const { connectedCase } = props.connectedCaseState;
    const { strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      const contact = await submitContactForm(task, form, connectedCase);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(contact.id, connectedCase.id);
      props.markCaseAsUpdated(task.taskSid);
      await completeTask(task);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  if (props.routing.route === 'csam-report') return null;

  const { route, subroute } = props.routing;

  // Redirects to the proper view when the user clicks 'Close' button.
  const handleClose = () => {
    props.updateTempInfo(null, props.task.taskSid);
    if (route === 'select-call-type') {
      props.changeRoute({ route: 'select-call-type' }, props.task.taskSid);
    } else if (route === 'new-case') {
      props.changeRoute({ route: 'new-case' }, props.task.taskSid);
    } else {
      props.changeRoute({ route: 'tabbed-forms', subroute: 'search' }, props.task.taskSid);
    }
  };

  type CaseItemRoute<T extends TemporaryCaseInfo = TemporaryCaseInfo> = T['screen'] & AppRoutesWithCase['subroute'];

  type CaseItemInfo<T extends TemporaryCaseInfo> = T['info']; // A bit redundant but looks cleaner than the anonymous subtype reference syntax

  const onCaseItemActionClick = <T extends TemporaryCaseInfo>(
    targetSubroute: CaseItemRoute<T>,
  ): ((entry: CaseItemInfo<T>) => void) => (entry: CaseItemInfo<T>) => {
    props.updateTempInfo({ screen: targetSubroute, info: entry } as TemporaryCaseInfo, props.task.taskSid);
    props.changeRoute({ route, subroute: targetSubroute } as AppRoutes, props.task.taskSid);
  };

  const onAddCaseItemClick = (targetSubroute: CaseItemRoute) => () => {
    props.updateTempInfo({ screen: targetSubroute, info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: targetSubroute } as AppRoutes, props.task.taskSid);
  };

  const onInfoChange = (fieldName, value) => {
    const { connectedCase } = props.connectedCaseState;
    const { info } = connectedCase;
    const newInfo = info ? { ...info, [fieldName]: value } : { [fieldName]: value };
    props.updateCaseInfo(newInfo, props.task.taskSid);
  };

  const onStatusChange = value => {
    props.updateCaseStatus(value, props.task.taskSid);
  };

  const onClickChildIsAtRisk = () => {
    const { connectedCase } = props.connectedCaseState;
    const { info } = connectedCase;
    const childIsAtRisk = !Boolean(info && info.childIsAtRisk);
    const newInfo = info ? { ...info, childIsAtRisk } : { childIsAtRisk };
    props.updateCaseInfo(newInfo, props.task.taskSid);
  };

  if (!props.connectedCaseState) return null;

  const { task, form, counselorsHash } = props;

  const { connectedCase, caseHasBeenEdited, prevStatus } = props.connectedCaseState;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories && form?.helpline) {
      return transformCategories(form.helpline, form.categories);
    }
    return null;
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { strings } = getConfig();

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      props.setConnectedCase(updatedCase, task.taskSid, false);
      props.updateCases(task.taskSid, updatedCase);
      // IF case has been edited from All Cases view, we should update that view
      if (props.updateAllCasesView) {
        props.updateAllCasesView(updatedCase);
      }
    } catch (error) {
      console.error(error);
      recordBackendError('Update Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const onPrintCase = () => {
    props.changeRoute({ route, subroute: 'case-print-view' }, task.taskSid);
  };

  const isMockedMessageOpen = Boolean(mockedMessage);

  const firstConnectedContact = connectedCase && connectedCase.connectedContacts && connectedCase.connectedContacts[0];
  const name = firstConnectedContact
    ? getFirstNameAndLastNameFromContact(firstConnectedContact)
    : getFirstNameAndLastNameFromForm(form);

  const fullName = splitFullName(name);
  const categories = getCategories(firstConnectedContact);
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const { workerSid, featureFlags } = getConfig();
  const caseCounselor = counselorsHash[twilioWorkerId];
  const currentCounselor = counselorsHash[workerSid];
  const openedDate = getLocaleDateTime(createdAt);
  const lastUpdatedDate = getLocaleDateTime(updatedAt);
  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  // -- Converting followUpDate to match the same format as the rest of the dates
  const followUpPrintedDate = info && info.followUpDate ? getLocaleDateTime(info.followUpDate) : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];
  const documents = info && info.documents ? info.documents : [];
  const childIsAtRisk = info && info.childIsAtRisk;
  const referrals = props.connectedCaseReferrals;
  const notes = timeline.filter(x => x.type === 'note');
  const summary = info?.summary;
  const definitionVersion = props.definitionVersions[version];
  const office = getHelplineData(connectedCase.helpline, definitionVersion.helplineInformation);

  const addScreenProps = {
    task: props.task,
    counselor: currentCounselor,
    counselorsHash,
    onClickClose: handleClose,
    definitionVersion,
  };

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const caseDetails = {
    id: connectedCase.id,
    name,
    categories,
    status,
    caseCounselor,
    currentCounselor,
    openedDate,
    lastUpdatedDate,
    followUpDate: followUpPrintedDate,
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
  };

  const itemRowRenderer = <TViewCaseInfo extends TemporaryCaseInfo, TEditCaseInfo extends TemporaryCaseInfo>(
    itemTypeName: string,
    viewSubroute: CaseItemRoute,
    editSubroute: CaseItemRoute,
    items: CaseItemInfo<TViewCaseInfo>[],
  ) => {
    const itemRows = () => {
      return items.length ? (
        <>
          {items.map((item, index) => (
            <InformationRow
              key={`${itemTypeName}-${index}`}
              person={item[itemTypeName]}
              onClickView={() => onCaseItemActionClick<TViewCaseInfo>(viewSubroute)(item)}
              onClickEdit={() => onCaseItemActionClick<TEditCaseInfo>(editSubroute)({ ...item, index })}
            />
          ))}
        </>
      ) : null;
    };
    itemRows.displayName = `${name}Rows`;
    return itemRows;
  };

  const householdRows = itemRowRenderer<ViewTemporaryCaseInfo, EditTemporaryCaseInfo>(
    'form',
    NewCaseSubroutes.ViewHousehold,
    NewCaseSubroutes.EditHousehold,
    households.map(h => {
      const { household, ...caseInfoItem } = { ...h, form: h.household, id: null };
      return caseInfoItem;
    }),
  );

  const perpetratorRows = itemRowRenderer<ViewTemporaryCaseInfo, EditTemporaryCaseInfo>(
    'form',
    NewCaseSubroutes.ViewPerpetrator,
    NewCaseSubroutes.EditPerpetrator,
    perpetrators.map(p => {
      const { perpetrator, ...caseInfoItem } = { ...p, form: p.perpetrator, id: null };
      return caseInfoItem;
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
                onCaseItemActionClick<ViewTemporaryCaseInfo>(NewCaseSubroutes.ViewIncident)(caseItemEntry)
              }
              onClickEdit={() =>
                onCaseItemActionClick<EditTemporaryCaseInfo>(NewCaseSubroutes.EditIncident)({ ...caseItemEntry, index })
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
                onCaseItemActionClick<ViewTemporaryCaseInfo>(NewCaseSubroutes.ViewDocument)(caseItemEntry)
              }
              onClickEdit={() =>
                onCaseItemActionClick<EditTemporaryCaseInfo>(NewCaseSubroutes.EditDocument)(caseItemEntry)
              }
            />
          );
        })}
      </>
    ) : null;
  };
  switch (subroute) {
    case NewCaseSubroutes.AddNote:
    case NewCaseSubroutes.EditNote:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            layout: {},
            itemType: 'Note',
            route,
            formDefinition: caseForms.NoteForm,
          }}
          applyTemporaryInfoToCase={updateCaseListByIndex<String>(
            ci => {
              ci.notes = ci.notes ?? [];
              return ci.notes;
            },
            temp => (temp.form.note ?? '').toString(),
          )}
        />
      );
    case NewCaseSubroutes.AddReferral:
    case NewCaseSubroutes.EditReferral:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            layout: {},
            itemType: 'Referral',
            route,
            formDefinition: caseForms.ReferralForm,
          }}
          applyTemporaryInfoToCase={updateCaseListByIndex<ReferralEntry>(
            ci => {
              ci.referrals = ci.referrals ?? [];
              return ci.referrals;
            },
            temp => ({ ...temp.form }),
          )}
        />
      );
    case NewCaseSubroutes.AddHousehold:
    case NewCaseSubroutes.EditHousehold:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.households,
            itemType: 'Household',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('households', 'household'),
            formDefinition: caseForms.HouseholdForm,
          }}
        />
      );
    case NewCaseSubroutes.AddPerpetrator:
    case NewCaseSubroutes.EditPerpetrator:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.perpetrators,
            itemType: 'Perpetrator',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('perpetrators', 'perpetrator'),
            formDefinition: caseForms.PerpetratorForm,
          }}
        />
      );
    case NewCaseSubroutes.AddIncident:
    case NewCaseSubroutes.EditIncident:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.incidents,
            itemType: 'Incident',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('incidents', 'incident'),
            formDefinition: caseForms.IncidentForm,
          }}
        />
      );
    case NewCaseSubroutes.AddDocument:
    case NewCaseSubroutes.EditDocument:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.documents,
            itemType: 'Document',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('documents', 'document'),
            formDefinition: caseForms.DocumentForm,
            customFormHandlers: documentUploadHandler,
            reactHookFormOptions: {
              shouldUnregister: false,
            },
          }}
        />
      );
    case NewCaseSubroutes.ViewContact:
      return <ViewContact {...addScreenProps} />;
    case NewCaseSubroutes.ViewNote:
      return <ViewCaseItem {...addScreenProps} itemType="Note" formDefinition={definitionVersion.caseForms.NoteForm} />;
    case NewCaseSubroutes.ViewHousehold:
      return <ViewCaseItem {...addScreenProps} itemType="Household" formDefinition={caseForms.HouseholdForm} />;
    case NewCaseSubroutes.ViewPerpetrator:
      return <ViewCaseItem {...addScreenProps} itemType="Perpetrator" formDefinition={caseForms.PerpetratorForm} />;
    case NewCaseSubroutes.ViewIncident:
      return <ViewCaseItem {...addScreenProps} itemType="Incident" formDefinition={caseForms.IncidentForm} />;
    case NewCaseSubroutes.ViewReferral:
      return <ViewCaseItem {...addScreenProps} itemType="Referral" formDefinition={caseForms.ReferralForm} />;
    case NewCaseSubroutes.ViewDocument:
      return <ViewCaseItem {...addScreenProps} itemType="Document" formDefinition={caseForms.DocumentForm} />;
    case NewCaseSubroutes.CasePrintView:
      return <CasePrintView caseDetails={caseDetails} {...addScreenProps} />;
    default:
      return loading || !definitionVersion ? (
        <CenteredContainer>
          <CircularProgress size={50} />
        </CenteredContainer>
      ) : (
        <>
          <CaseContainer>
            <Box marginLeft="25px" marginTop="13px">
              <CaseDetails
                caseId={connectedCase.id}
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
                definitionVersionName={connectedCase.info.definitionVersion}
                isOrphanedCase={!firstConnectedContact}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Timeline
                timelineActivities={timeline}
                caseObj={connectedCase}
                taskSid={task.taskSid}
                form={form}
                can={can}
                route={route}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSection
                can={can}
                onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.AddHousehold)}
                sectionTypeId="Household"
              >
                {householdRows()}
              </CaseSection>
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSection
                can={can}
                onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.AddPerpetrator)}
                sectionTypeId="Perpetrator"
              >
                {perpetratorRows()}
              </CaseSection>
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSection
                can={can}
                onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.AddIncident)}
                sectionTypeId="Incident"
              >
                {incidentRows()}
              </CaseSection>
            </Box>
            {featureFlags.enable_upload_documents && (
              <Box marginLeft="25px" marginTop="25px">
                <CaseSection
                  onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.AddDocument)}
                  can={can}
                  sectionTypeId="Document"
                >
                  {documentRows()}
                </CaseSection>
              </Box>
            )}
            <Box marginLeft="25px" marginTop="25px">
              <CaseSummary task={props.task} readonly={!can(PermissionActions.EDIT_CASE_SUMMARY)} />
            </Box>
            <Dialog onClose={closeMockedMessage} open={isMockedMessageOpen}>
              <DialogContent>{mockedMessage}</DialogContent>
            </Dialog>
            <Menu anchorEl={anchorEl} open={isMenuOpen} onClickAway={() => setMenuOpen(false)}>
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
            {props.isCreating && (
              <>
                <Box marginRight="15px">
                  <StyledNextStepButton secondary roundCorners onClick={toggleCaseMenu}>
                    <Template code="BottomBar-Cancel" />
                  </StyledNextStepButton>
                </Box>
                <StyledNextStepButton roundCorners onClick={handleSaveAndEnd}>
                  <Template code="BottomBar-SaveAndEnd" />
                </StyledNextStepButton>
              </>
            )}
            {!props.isCreating && (
              <>
                <Box marginRight="15px">
                  <StyledNextStepButton secondary roundCorners onClick={props.handleClose}>
                    <Template code="BottomBar-Close" />
                  </StyledNextStepButton>
                </Box>
                <StyledNextStepButton disabled={!caseHasBeenEdited} roundCorners onClick={handleUpdate}>
                  <Template code="BottomBar-Update" />
                </StyledNextStepButton>
              </>
            )}
          </BottomButtonBar>
        </>
      );
  }
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  connectedCaseState: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid],
  connectedCaseId: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.id,
  connectedCaseNotes: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.info?.notes,
  connectedCaseReferrals:
    state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.info?.referrals,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
  definitionVersions: state[namespace][configurationBase].definitionVersions,
});

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
  removeConnectedCase: CaseActions.removeConnectedCase,
  updateCaseInfo: CaseActions.updateCaseInfo,
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseStatus: CaseActions.updateCaseStatus,
  setConnectedCase: CaseActions.setConnectedCase,
  markCaseAsUpdated: CaseActions.markCaseAsUpdated,
  updateCases: SearchActions.updateCases,
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
