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

import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import SearchIcon from '@material-ui/icons/Search';
import { Template } from '@twilio/flex-ui';
import { callTypes } from 'hrm-form-definitions';

import { removeOfflineContact } from '../../services/formSubmissionHelpers';
import { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { Contact, ContactRawJson, isOfflineContact, isOfflineContactTask } from '../../types/types';
import { isNonDataCallType } from '../../states/validationRules';
import { selectCaseMergingBanners } from '../../states/case/caseBanners';
import { ContactDraftChanges, updateDraft } from '../../states/contacts/existingContacts';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { emptyCategories } from '../../states/contacts/reducer';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import { CSAMReportType, CSAMReportTypes } from '../../states/csam-report/types';
import { changeRoute, newOpenModalAction } from '../../states/routing/actions';
import { AppRoutes, ChangeRouteMode, TabbedFormRoute, TabbedFormSubroutes } from '../../states/routing/types';
import { Box, Row, StyledTabs, FontOpenSans, OpaqueText, Bold } from '../../styles';
import { TabbedFormsContainer, TabbedFormTabContainer } from './styles';
import { hasTaskControl } from '../../transfer/transferTaskState';
import ContactAddedToCaseBanner from '../caseMergingBanners/ContactAddedToCaseBanner';
import ContactRemovedFromCaseBanner from '../caseMergingBanners/ContactRemovedFromCaseBanner';
import FormTab from '../common/forms/FormTab';
import ContactDetailsSectionForm from '../contact/ContactDetailsSectionForm';
import IssueCategorizationSectionForm from '../contact/IssueCategorizationSectionForm';
import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import BottomBar from './BottomBar';
import ContactlessTaskTab from './ContactlessTaskTab';
import CSAMAttachments from './CSAMAttachments';
import CSAMReportButton from './CSAMReportButton';
import { TabbedFormsCommonProps } from './types';
import { useTabbedFormContext } from './hooks/useTabbedForm';
// Ensure we import any custom components that might be used in a form
import '../contact/ResourceReferralList';
import selectContextContactId from '../../states/contacts/selectContextContactId';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const {
    [namespace]: { configuration, routing: routingState },
  } = state;
  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid);
  const { draftContact, savedContact } = selectContactByTaskSid(state, taskSid);
  const contactId = savedContact.id;
  const { showConnectedToCaseBanner, showRemovedFromCaseBanner } = selectCaseMergingBanners(state, contactId);
  const { currentDefinitionVersion } = configuration;
  return {
    contactId,
    currentDefinitionVersion,
    currentRoute,
    draftContact,
    savedContact,
    showConnectedToCaseBanner,
    showRemovedFromCaseBanner,
    updatedContact: getUnsavedContact(savedContact, draftContact),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => ({
  backToCallTypeSelect: () =>
    dispatch(changeRoute({ route: 'select-call-type' }, task.taskSid, ChangeRouteMode.Replace)),
  clearCallType: (savedContact: Contact, otherChanges: ContactDraftChanges) =>
    asyncDispatch(dispatch)(
      updateContactInHrmAsyncAction(
        savedContact,
        { ...otherChanges, rawJson: { ...otherChanges?.rawJson, callType: '' } },
        task.taskSid,
      ),
    ),
  navigateToTab: (tab: TabbedFormSubroutes) =>
    dispatch(
      changeRoute({ route: 'tabbed-forms', subroute: tab, autoFocus: false }, task.taskSid, ChangeRouteMode.Replace),
    ),
  newCSAMReport: (contactId, csamReportType: CSAMReportType) =>
    dispatch(newCSAMReportActionForContact(contactId, csamReportType, true)),
  openCSAMReport: (previousRoute: AppRoutes) =>
    dispatch(changeRoute({ route: 'csam-report', subroute: 'form', previousRoute }, task.taskSid)),
  openSearchModal: (contextContactId: string) =>
    dispatch(newOpenModalAction({ contextContactId, route: 'search', subroute: 'form' }, task.taskSid)),
  removeIfOfflineContact: (contact: Contact) => removeOfflineContact(dispatch, contact),
  saveDraft: (savedContact: Contact, draftContact: ContactDraftChanges) =>
    asyncDispatch(dispatch)(updateContactInHrmAsyncAction(savedContact, draftContact, task.taskSid)),
  updateDraftForm: (contactId: Contact['id'], form: Partial<ContactRawJson>) =>
    dispatch(updateDraft(contactId, { rawJson: form })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const mapTabsComponents = (errors: any) => (t: TabbedFormSubroutes | 'search') => {
  switch (t) {
    case 'search':
      return <FormTab key="SearchTab" searchTab icon={<SearchIcon style={{ fontSize: '20px' }} />} />;
    case 'contactlessTask':
      return <FormTab key="ContactInformation" label="TabbedForms-AddContactInfoTab" error={errors.contactlessTask} />;
    case 'callerInformation':
      return <FormTab key="CallerInfoTab" label="TabbedForms-AddCallerInfoTab" error={errors.callerInformation} />;
    case 'childInformation':
      return <FormTab key="ChildInfoTab" label="TabbedForms-AddChildInfoTab" error={errors.childInformation} />;
    case 'categories':
      return <FormTab key="CategoriesTab" label="TabbedForms-CategoriesTab" error={errors.categories} />;
    case 'caseInformation':
      return <FormTab key="CaseInfoTab" label="TabbedForms-AddCaseInfoTab" error={errors.caseInformation} />;
    default:
      return null;
  }
};

const isEmptyCallType = callType => [null, undefined, ''].includes(callType);

const mapTabsToIndex = (contact: Contact, contactForm: Partial<ContactRawJson>): (TabbedFormSubroutes | 'search')[] => {
  const isCallerType = contactForm.callType === callTypes.caller;

  if (isOfflineContact(contact)) {
    if (isNonDataCallType(contactForm.callType)) return ['contactlessTask'];

    return isCallerType
      ? ['search', 'contactlessTask', 'callerInformation', 'childInformation', 'categories', 'caseInformation']
      : ['search', 'contactlessTask', 'childInformation', 'categories', 'caseInformation'];
  }

  if (isEmptyCallType(contactForm.callType)) return ['search'];

  return isCallerType
    ? ['search', 'callerInformation', 'childInformation', 'categories', 'caseInformation']
    : ['search', 'childInformation', 'categories', 'caseInformation'];
};

const TabbedFormsTabs: React.FC<Props> = ({
  task,
  savedContact,
  contactId,
  currentDefinitionVersion,
  currentRoute,
  draftContact,
  showConnectedToCaseBanner,
  showRemovedFromCaseBanner,
  updatedContact,
  backToCallTypeSelect,
  clearCallType,
  navigateToTab,
  newCSAMReport,
  openCSAMReport,
  openSearchModal,
  removeIfOfflineContact,
  saveDraft,
  updateDraftForm,
}) => {
  const { enable_csam_report: csamReportEnabled, enable_case_merging: caseMergingEnabled } = getAseloFeatureFlags();
  const { contactSaveFrequency } = getHrmConfig();
  const { subroute, autoFocus } = currentRoute as TabbedFormRoute;

  const { methods, newSubmitHandler } = useTabbedFormContext();
  const { setValue } = methods;

  const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render.

  /**
   * Clear some parts of the form state when helpline changes.
   */
  React.useEffect(() => {
    if (isMounted.current) setValue('categories', emptyCategories);
    else isMounted.current = true;
  }, [savedContact?.helpline, setValue]);

  const csamAttachments = React.useMemo(
    () => savedContact && <CSAMAttachments csamReports={savedContact.csamReports} />,
    [savedContact],
  );

  if (!currentDefinitionVersion) return null;

  const optionalButtons =
    isOfflineContact(savedContact) && subroute === 'contactlessTask'
      ? [
          {
            label: 'CancelOfflineContact',
            onClick: () => removeIfOfflineContact(savedContact),
          },
        ]
      : undefined;

  const {
    rawJson: { callType, callerInformation, childInformation, caseInformation, contactlessTask },
    helpline,
  } = updatedContact;

  const tabsToIndex = mapTabsToIndex(savedContact, updatedContact.rawJson);
  // tabIndex -1 doesn't cause user facing errors but it does generate lots of console log noise
  const tabIndex = Math.max(
    tabsToIndex.findIndex(t => t === subroute),
    0,
  );
  const tabs = tabsToIndex.map(mapTabsComponents(methods.errors));

  // TODO: abstract this to a separate file for shared use
  const isCallerType = updatedContact.rawJson.callType === callTypes.caller;
  const isDataCallType = !isNonDataCallType(callType);
  const showSubmitButton = !isEmptyCallType(callType) && tabIndex === tabs.length - 1;

  const handleBackButton = async () => {
    if (!hasTaskControl(task)) return;
    await clearCallType(savedContact, draftContact);
    backToCallTypeSelect();
  };

  const handleTabsChange = async (t: number) => {
    const tab = tabsToIndex[t];
    if (contactSaveFrequency === 'onTabChange') {
      saveDraft(savedContact, draftContact);
    }
    if (tab === 'search') {
      openSearchModal(contactId);
    } else {
      navigateToTab(tab);
    }
  };

  const HeaderControlButtons = () => (
    <Box marginTop="10px" marginBottom="10px" paddingLeft="20px">
      <Row>
        <SearchResultsBackButton handleBack={handleBackButton} text={<Template code="TabbedForms-BackButton" />} />
        {csamReportEnabled && (
          <Box marginLeft="auto" marginRight="15px">
            <CSAMReportButton
              handleChildCSAMType={() => {
                newCSAMReport(contactId, CSAMReportTypes.CHILD);
                openCSAMReport(currentRoute);
              }}
              handleCounsellorCSAMType={() => {
                newCSAMReport(contactId, CSAMReportTypes.COUNSELLOR);
                openCSAMReport(currentRoute);
              }}
            />
          </Box>
        )}
      </Row>
    </Box>
  );

  return (
    <div role="form" style={{ height: '100%' }}>
      <TabbedFormsContainer>
          <Box paddingLeft="20px">
            <Row>
              <FontOpenSans>
                <Bold># {contactId}</Bold>
                {!isOfflineContactTask(task) && (<OpaqueText style={{ fontStyle: 'italic' }}> ({task.queueName})</OpaqueText> )}
              </FontOpenSans>
            </Row>
          </Box>
        <HeaderControlButtons />
        <StyledTabs
          className="hiddenWhenModalOpen"
          name="tab"
          variant="scrollable"
          scrollButtons="auto"
          value={tabIndex}
          onChange={(ev, tab) => handleTabsChange(tab)}
        >
          {tabs}
        </StyledTabs>
        {/* eslint-disable-next-line camelcase */}
        {caseMergingEnabled && (
          <>
            {showConnectedToCaseBanner && <ContactAddedToCaseBanner taskId={task.taskSid} />}
            {showRemovedFromCaseBanner && <ContactRemovedFromCaseBanner taskId={task.taskSid} />}
          </>
        )}
        <div style={{ height: '100%', overflow: 'hidden' }}>
          {isOfflineContactTask(task) && (
            <TabbedFormTabContainer display={subroute === 'contactlessTask'}>
              <ContactlessTaskTab
                task={task}
                display={subroute === 'contactlessTask'}
                helplineInformation={currentDefinitionVersion.helplineInformation}
                definition={currentDefinitionVersion.tabbedForms.ContactlessTaskTab}
                initialValues={{ ...contactlessTask, helpline }}
                autoFocus={autoFocus}
              />
            </TabbedFormTabContainer>
          )}
          {isCallerType && (
            <TabbedFormTabContainer display={subroute === 'callerInformation'}>
              <ContactDetailsSectionForm
                tabPath="callerInformation"
                definition={currentDefinitionVersion.tabbedForms.CallerInformationTab}
                layoutDefinition={currentDefinitionVersion.layoutVersion.contact.callerInformation}
                initialValues={callerInformation}
                display={subroute === 'callerInformation'}
                autoFocus={autoFocus}
                updateForm={values => updateDraftForm(contactId, { callerInformation: values.callerInformation })}
                contactId={savedContact.id}
              />
            </TabbedFormTabContainer>
          )}
          {isDataCallType && (
            <>
              <TabbedFormTabContainer display={subroute === 'childInformation'}>
                <ContactDetailsSectionForm
                  tabPath="childInformation"
                  definition={currentDefinitionVersion.tabbedForms.ChildInformationTab}
                  layoutDefinition={currentDefinitionVersion.layoutVersion.contact.childInformation}
                  initialValues={childInformation}
                  display={subroute === 'childInformation'}
                  autoFocus={autoFocus}
                  updateForm={values => updateDraftForm(contactId, { childInformation: values.childInformation })}
                  contactId={savedContact.id}
                />
              </TabbedFormTabContainer>
              <TabbedFormTabContainer display={subroute === 'categories'}>
                <IssueCategorizationSectionForm
                  stateApi={forExistingContact(savedContact.id)}
                  display={subroute === 'categories'}
                  definition={currentDefinitionVersion.tabbedForms.IssueCategorizationTab(helpline)}
                  autoFocus={autoFocus}
                />
              </TabbedFormTabContainer>
              <TabbedFormTabContainer display={subroute === 'caseInformation'}>
                <ContactDetailsSectionForm
                  tabPath="caseInformation"
                  definition={currentDefinitionVersion.tabbedForms.CaseInformationTab}
                  layoutDefinition={currentDefinitionVersion.layoutVersion.contact.caseInformation}
                  initialValues={caseInformation}
                  display={subroute === 'caseInformation'}
                  autoFocus={autoFocus}
                  extraChildrenRight={csamAttachments}
                  updateForm={values => updateDraftForm(contactId, { caseInformation: values.caseInformation })}
                  contactId={savedContact.id}
                />
              </TabbedFormTabContainer>
            </>
          )}
        </div>
        <div>
          <BottomBar
            contactId={savedContact.id}
            task={task}
            nextTab={() => handleTabsChange(tabIndex + 1)}
            saveUpdates={() => saveDraft(savedContact, draftContact)}
            // TODO: move this two functions to a separate file to centralize "handle task completions"
            showNextButton={tabIndex !== 0 && tabIndex < tabs.length - 1}
            showSubmitButton={showSubmitButton}
            handleSubmitIfValid={newSubmitHandler} // TODO: this should be used within BottomBar, but that requires a small refactor to make it a functional component
            optionalButtons={optionalButtons}
          />
        </div>
      </TabbedFormsContainer>
    </div>
  );
};

TabbedFormsTabs.displayName = 'TabbedFormsTabs';

export default connector(TabbedFormsTabs);
