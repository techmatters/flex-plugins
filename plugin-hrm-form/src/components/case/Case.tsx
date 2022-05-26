/* eslint-disable react/prop-types,complexity,sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
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
import { cancelCase, updateCase } from '../../services/CaseService';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getActivitiesFromCase, isConnectedCaseActivity, sortActivities } from './caseActivities';
import { getDateFromNotSavedContact, getHelplineData } from './caseHelpers';
import { getLocaleDateTime } from '../../utils/helpers';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import ViewContact from './ViewContact';
import { CaseDetailsName, updateCaseListByIndex, updateCaseSectionListByIndex } from '../../states/case/types';
import { CustomITask, NoteEntry, ReferralEntry, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import { CaseItemAction, isAppRoutesWithCaseAndAction, NewCaseSubroutes } from '../../states/routing/types';
import CaseHome from './CaseHome';
import AddEditCaseItem from './AddEditCaseItem';
import ViewCaseItem from './ViewCaseItem';
import documentUploadHandler from './documentUploadHandler';
import { recordBackendError } from '../../fullStory';
import { completeTask, submitContactForm } from '../../services/formSubmissionHelpers';
import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { CenteredContainer } from '../../styles/case';

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

const Case: React.FC<Props> = ({
  task,
  form,
  counselorsHash,
  setConnectedCase,
  removeConnectedCase,
  updateCaseInfo,
  updateCaseStatus,
  markCaseAsUpdated,
  changeRoute,
  isCreating,
  handleClose,
  routing,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    /**
     * Gets the activities timeline from current caseId
     * If the case is just being created, adds the case's description as a new activity.
     */
    const getTimeline = () => {
      if (!props.connectedCaseId) return;
      setLoading(true);
      const activities = getActivitiesFromCase(props.connectedCaseState.connectedCase);
      setLoading(false);
      let timelineActivities = sortActivities(activities);

      const isCreatingCase = !timelineActivities.some(isConnectedCaseActivity);

      if (isCreatingCase) {
        if (isStandaloneITask(task)) return;
        const date = getDateFromNotSavedContact(task, form);
        const { workerSid } = getConfig();
        const connectCaseActivity = {
          date: format(date, 'yyyy-MM-dd HH:mm:ss'),
          createdAt: new Date().toISOString(),
          type: task.channelType,
          text: form.caseInformation.callSummary.toString(),
          twilioWorkerId: workerSid,
          channel: task.channelType === 'default' ? form.contactlessTask.channel.toString() : task.channelType,
          originalIndex: 0,
        };

        timelineActivities = sortActivities([...timelineActivities, connectCaseActivity]);
      }
      setTimeline(timelineActivities);
    };

    getTimeline();
  }, [task, form, props.connectedCaseId, props.connectedCaseState?.connectedCase, setLoading]);

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

  if (routing.route === 'csam-report') return null;

  // Redirects to the proper view when the user clicks 'Close' button.
  const handleCloseSubSection = () => {
    props.updateTempInfo(null, task.taskSid);
    if (routing.route === 'select-call-type') {
      changeRoute({ route: 'select-call-type' }, task.taskSid);
    } else if (routing.route === 'new-case') {
      changeRoute({ route: 'new-case' }, task.taskSid);
    } else {
      changeRoute({ route: 'tabbed-forms', subroute: 'search' }, task.taskSid);
    }
  };

  if (!props.connectedCaseState) return null;

  const { connectedCase, prevStatus, caseHasBeenEdited } = props.connectedCaseState;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories && form?.helpline) {
      return transformCategories(form.helpline, form.categories);
    }
    return null;
  };

  const { can } = getPermissionsForCase(connectedCase.twilioWorkerId, prevStatus);

  const firstConnectedContact = connectedCase && connectedCase.connectedContacts && connectedCase.connectedContacts[0];
  const name = firstConnectedContact
    ? getFirstNameAndLastNameFromContact(firstConnectedContact)
    : getFirstNameAndLastNameFromForm(form);

  const categories = getCategories(firstConnectedContact);
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const { workerSid } = getConfig();
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
  const childIsAtRisk = info && info.childIsAtRisk;
  const referrals = info?.referrals;
  const notes = timeline.filter(x => x.type === 'note');
  const summary = info?.summary;
  const definitionVersion = props.definitionVersions[version];
  const office = getHelplineData(connectedCase.helpline, definitionVersion.helplineInformation);

  const onInfoChange = (fieldName, value) => {
    const newInfo = info ? { ...info, [fieldName]: value } : { [fieldName]: value };
    updateCaseInfo(newInfo, task.taskSid);
  };

  const onStatusChange = (value: string) => {
    updateCaseStatus(value, task.taskSid);
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      setConnectedCase(updatedCase, task.taskSid, false);
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

    changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation', autoFocus: true }, task.taskSid);
    removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      const contact = await submitContactForm(task, form, connectedCase);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(contact.id, connectedCase.id);
      markCaseAsUpdated(task.taskSid);
      await completeTask(task);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const caseDetails = {
    id: connectedCase.id,
    name,
    categories,
    status,
    prevStatus,
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
    contacts: connectedCase?.connectedContacts ?? [],
  };
  if (isAppRoutesWithCaseAndAction(routing)) {
    const { action, subroute } = routing;

    const addScreenProps = {
      task,
      routing,
      counselor: currentCounselor,
      counselorsHash,
      exitItem: handleCloseSubSection,
      definitionVersion,
    };

    switch (subroute) {
      case NewCaseSubroutes.Note:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Note"
              formDefinition={caseForms.NoteForm}
              canEdit={() => can(PermissionActions.EDIT_NOTE)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
              layout: {},
              itemType: 'Note',
              formDefinition: caseForms.NoteForm,
            }}
            applyTemporaryInfoToCase={updateCaseListByIndex<NoteEntry>(
              ci => {
                ci.counsellorNotes = ci.counsellorNotes ?? [];
                return ci.counsellorNotes;
              },
              temp => {
                const { form: noteForm, ...entryInfo } = temp;
                return {
                  ...noteForm,
                  ...entryInfo,
                };
              },
            )}
          />
        );
      case NewCaseSubroutes.Referral:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Referral"
              formDefinition={caseForms.ReferralForm}
              canEdit={() => can(PermissionActions.EDIT_REFERRAL)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
              layout: {},
              itemType: 'Referral',
              formDefinition: caseForms.ReferralForm,
            }}
            applyTemporaryInfoToCase={updateCaseListByIndex<ReferralEntry>(
              ci => {
                ci.referrals = ci.referrals ?? [];
                return ci.referrals;
              },
              temp => {
                const { form: referralForm, ...entryInfo } = temp;
                return {
                  ...referralForm,
                  referredTo: referralForm.referredTo as string,
                  date: referralForm.date as string,
                  ...entryInfo,
                };
              },
            )}
          />
        );
      case NewCaseSubroutes.Household:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Household"
              formDefinition={caseForms.HouseholdForm}
              canEdit={() => can(PermissionActions.EDIT_HOUSEHOLD)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
              layout: caseLayouts.households,
              itemType: 'Household',
              applyTemporaryInfoToCase: updateCaseSectionListByIndex('households', 'household'),
              formDefinition: caseForms.HouseholdForm,
            }}
          />
        );
      case NewCaseSubroutes.Perpetrator:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Perpetrator"
              formDefinition={caseForms.PerpetratorForm}
              canEdit={() => can(PermissionActions.EDIT_PERPETRATOR)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
              layout: caseLayouts.perpetrators,
              itemType: 'Perpetrator',
              applyTemporaryInfoToCase: updateCaseSectionListByIndex('perpetrators', 'perpetrator'),
              formDefinition: caseForms.PerpetratorForm,
            }}
          />
        );
      case NewCaseSubroutes.Incident:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Incident"
              formDefinition={caseForms.IncidentForm}
              canEdit={() => can(PermissionActions.EDIT_INCIDENT)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
              layout: caseLayouts.incidents,
              itemType: 'Incident',
              applyTemporaryInfoToCase: updateCaseSectionListByIndex('incidents', 'incident'),
              formDefinition: caseForms.IncidentForm,
            }}
          />
        );
      case NewCaseSubroutes.Document:
        if (action === CaseItemAction.View) {
          return (
            <ViewCaseItem
              {...addScreenProps}
              itemType="Document"
              formDefinition={caseForms.DocumentForm}
              canEdit={() => can(PermissionActions.EDIT_DOCUMENT)}
            />
          );
        }
        return (
          <AddEditCaseItem
            {...{
              ...addScreenProps,
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
      default:
      // Fall through to next switch for other routes without actions
    }
  }

  switch (routing.subroute) {
    case NewCaseSubroutes.ViewContact:
      return <ViewContact onClickClose={handleCloseSubSection} task={task} />;
    case NewCaseSubroutes.CasePrintView:
      return (
        <CasePrintView
          caseDetails={caseDetails}
          {...{ counselorsHash, onClickClose: handleCloseSubSection, definitionVersion }}
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
          handleClose={handleClose}
          handleCancelNewCaseAndClose={handleCancelNewCaseAndClose}
          handleUpdate={handleUpdate}
          handleSaveAndEnd={handleSaveAndEnd}
          onInfoChange={onInfoChange}
          onStatusChange={onStatusChange}
          isCreating={isCreating}
          isEdited={Boolean(caseHasBeenEdited)}
          can={can}
        />
      );
  }
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  connectedCaseState: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid],
  connectedCaseId: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.id,
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
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
