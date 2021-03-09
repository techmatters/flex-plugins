/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { format } from 'date-fns';

import { StandaloneITask } from '../StandaloneSearch';
import {
  namespace,
  contactFormsBase,
  connectedCaseBase,
  configurationBase,
  routingBase,
  RootState,
} from '../../states';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase, transformCategories } from '../../services/ContactService';
import { cancelCase, updateCase, getActivities } from '../../services/CaseService';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { isConnectedCaseActivity, getDateFromNotSavedContact, sortActivities } from './caseHelpers';
import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseContainer, CenteredContainer } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import { formatName } from '../../utils';
import * as SearchActions from '../../states/search/actions';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import Timeline from './Timeline';
import AddNote from './AddNote';
import AddReferral from './AddReferral';
import Households from './Households';
import Perpetrators from './Perpetrators';
import Incidents from './Incidents';
import CaseSummary from './CaseSummary';
import ViewContact from './ViewContact';
import AddHousehold from './AddHousehold';
import AddPerpetrator from './AddPerpetrator';
import AddIncident from './AddIncident';
import ViewNote from './ViewNote';
import ViewHousehold from './ViewHousehold';
import ViewPerpetrator from './ViewPerpetrator';
import ViewIncident from './ViewIncident';
import ViewReferral from './ViewReferral';
import type { CaseDetailsName } from '../../states/case/types';
import type { HouseholdEntry, PerpetratorEntry, IncidentEntry, Case as CaseType } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';

const isStandaloneITask = (task): task is StandaloneITask => {
  return task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: ITask | StandaloneITask;
  isCreating?: boolean;
  handleClose?: () => void;
  handleCompleteTask?: (taskSid: string, task: ITask) => void;
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
  const { route, subroute } = props.routing;

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

    props.changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation' }, task.taskSid);
    props.removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { task, form } = props;
    const { connectedCase } = props.connectedCaseState;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      props.markCaseAsUpdated(task.taskSid);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      console.error(error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

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

  const onClickAddHousehold = () => {
    props.updateTempInfo({ screen: 'add-household', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-household' }, props.task.taskSid);
  };

  const onClickAddPerpetrator = () => {
    props.updateTempInfo({ screen: 'add-perpetrator', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-perpetrator' }, props.task.taskSid);
  };

  const onClickAddIncident = () => {
    props.updateTempInfo({ screen: 'add-incident', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-incident' }, props.task.taskSid);
  };

  const onClickViewHousehold = (household: HouseholdEntry) => {
    props.updateTempInfo({ screen: 'view-household', info: household }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-household' }, props.task.taskSid);
  };

  const onClickViewPerpetrator = (perpetrator: PerpetratorEntry) => {
    props.updateTempInfo({ screen: 'view-perpetrator', info: perpetrator }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-perpetrator' }, props.task.taskSid);
  };

  const onClickViewIncident = (incident: IncidentEntry) => {
    props.updateTempInfo({ screen: 'view-incident', info: incident }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-incident' }, props.task.taskSid);
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

  /**
   * Setting this flag in the first render.
   */
  const [isEditing, setIsEditing] = useState(
    props.connectedCaseState?.connectedCase && props.connectedCaseState?.connectedCase?.status === 'open',
  );

  if (!props.connectedCaseState) return null;

  const { task, form, counselorsHash } = props;

  const { connectedCase, caseHasBeenEdited } = props.connectedCaseState;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories) {
      return transformCategories(form.categories);
    }
    return null;
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { strings } = getConfig();

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      props.markCaseAsUpdated(task.taskSid);
      props.updateCases(task.taskSid, updatedCase);
      // IF case has been edited from All Cases view, we should update that view
      if (props.updateAllCasesView) {
        props.updateAllCasesView(updatedCase);
      }
      setIsEditing(connectedCase.status === 'open');
    } catch (error) {
      console.error(error);
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
  const { workerSid } = getConfig(); // -- Gets the current counselor that is using the application.
  const caseCounselor = counselorsHash[twilioWorkerId];
  const currentCounselor = counselorsHash[workerSid];
  const openedDate = new Date(createdAt).toLocaleDateString(navigator.language);
  const lastUpdatedDate = new Date(updatedAt).toLocaleDateString(navigator.language);
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];
  const childIsAtRisk = info && info.childIsAtRisk;

  const definitionVersion = props.definitionVersions[version];

  const addScreenProps = {
    task: props.task,
    counselor: currentCounselor,
    onClickClose: handleClose,
    definitionVersion,
  };

  const caseDetails = {
    id: connectedCase.id,
    name,
    categories,
    status,
    caseCounselor,
    currentCounselor,
    openedDate,
    lastUpdatedDate,
    followUpDate,
    households,
    perpetrators,
    incidents,
    childIsAtRisk,
    officeName: 'Gautang', // ToDo: add the office here.
    version,
    contact: firstConnectedContact,
  };

  console.log('Case Details: ', JSON.stringify(caseDetails));

  switch (subroute) {
    case 'add-note':
      return <AddNote {...addScreenProps} />;
    case 'add-referral':
      return <AddReferral {...addScreenProps} />;
    case 'add-household':
      return <AddHousehold {...addScreenProps} />;
    case 'add-perpetrator':
      return <AddPerpetrator {...addScreenProps} />;
    case 'add-incident':
      return <AddIncident {...addScreenProps} />;
    case 'view-contact':
      return <ViewContact {...addScreenProps} />;
    case 'view-note':
      return <ViewNote {...addScreenProps} />;
    case 'view-household':
      return <ViewHousehold {...addScreenProps} />;
    case 'view-perpetrator':
      return <ViewPerpetrator {...addScreenProps} />;
    case 'view-incident':
      return <ViewIncident {...addScreenProps} />;
    case 'view-referral':
      return <ViewReferral {...addScreenProps} />;
    case 'case-print-view':
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
                isEditing={isEditing}
                counselor={caseCounselor}
                categories={categories}
                openedDate={openedDate}
                lastUpdatedDate={lastUpdatedDate}
                followUpDate={followUpDate}
                childIsAtRisk={childIsAtRisk}
                handlePrintCase={onPrintCase}
                handleInfoChange={onInfoChange}
                handleStatusChange={onStatusChange}
                handleClickChildIsAtRisk={onClickChildIsAtRisk}
                definitionVersion={connectedCase.info.definitionVersion}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Timeline timelineActivities={timeline} caseObj={connectedCase} task={task} form={form} status={status} />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Households
                households={households}
                status={status}
                onClickAddHousehold={onClickAddHousehold}
                onClickView={onClickViewHousehold}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Perpetrators
                perpetrators={perpetrators}
                status={status}
                onClickAddPerpetrator={onClickAddPerpetrator}
                onClickView={onClickViewPerpetrator}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Incidents
                incidents={incidents}
                onClickAddIncident={onClickAddIncident}
                onClickView={onClickViewIncident}
                status={status}
                definitionVersion={definitionVersion}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSummary task={props.task} readonly={status === 'closed'} />
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
                {isEditing && (
                  <StyledNextStepButton disabled={!caseHasBeenEdited} roundCorners onClick={handleUpdate}>
                    <Template code="BottomBar-Update" />
                  </StyledNextStepButton>
                )}
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
  markCaseAsUpdated: CaseActions.markCaseAsUpdated,
  updateCases: SearchActions.updateCases,
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
