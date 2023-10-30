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

/* eslint-disable react/no-multi-comp */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { FormProvider, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../states';
import { completeTask, removeOfflineContact } from '../../services/formSubmissionHelpers';
import { changeRoute, newCloseModalAction, newOpenModalAction } from '../../states/routing/actions';
import { emptyCategories } from '../../states/contacts/reducer';
import { AppRoutes, ChangeRouteMode, isRouteWithModalSupport, TabbedFormSubroutes } from '../../states/routing/types';
import {
  ContactRawJson,
  CustomITask,
  isOfflineContactTask,
  Contact,
  isOfflineContact,
  Case as CaseForm,
} from '../../types/types';
import { Box, Row, StyledTabs, TabbedFormsContainer, TabbedFormTabContainer } from '../../styles/HrmStyles';
import FormTab from '../common/forms/FormTab';
import IssueCategorizationSectionForm from '../contact/IssueCategorizationSectionForm';
import ContactDetailsSectionForm from '../contact/ContactDetailsSectionForm';
import ContactlessTaskTab from './ContactlessTaskTab';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import { isNonDataCallType } from '../../states/validationRules';
import CSAMReportButton from './CSAMReportButton';
import CSAMAttachments from './CSAMAttachments';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import { CSAMReportType, CSAMReportTypes } from '../../states/csam-report/types';
// Ensure ww import any custom components that might be used in a form
import '../contact/ResourceReferralList';
import { ContactDraftChanges, updateDraft } from '../../states/contacts/existingContacts';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import asyncDispatch from '../../states/asyncDispatch';
import { submitContactFormAsyncAction, updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { namespace } from '../../states/storeNamespaces';
import Search from '../search';
import { getCurrentBaseRoute, getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { CaseLayout } from '../../styles/case';
import Case from '../case/Case';
import { ContactMetadata } from '../../states/contacts/types';
import ViewContact from '../case/ViewContact';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';

// eslint-disable-next-line react/display-name
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

type OwnProps = {
  task: CustomITask;
  contactId: string;
  csamReportEnabled: boolean;
  csamClcReportEnabled: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedForms: React.FC<Props> = ({
  currentRoute,
  savedContact,
  draftContact,
  updatedContact,
  currentDefinitionVersion,
  csamReportEnabled,
  csamClcReportEnabled,
  searchModalOpen,
  updateDraftForm,
  newCSAMReport,
  saveDraft,
  clearCallType,
  openCSAMReport,
  backToCallTypeSelect,
  navigateToTab,
  openSearchModal,
  closeModal,
  finaliseContact,
  metadata,
  task,
  isCallTypeCaller,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const csamAttachments = React.useMemo(() => <CSAMAttachments csamReports={savedContact.csamReports} />, [
    savedContact.csamReports,
  ]);

  const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render.

  const { setValue } = methods;
  const {
    rawJson: { callType, callerInformation, childInformation, caseInformation, contactlessTask },
    helpline,
  } = updatedContact;

  /**
   * Clear some parts of the form state when helpline changes.
   */
  React.useEffect(() => {
    if (isMounted.current) setValue('categories', emptyCategories);
    else isMounted.current = true;
  }, [helpline, setValue]);

  const onSelectSearchResult = (searchResult: Contact) => {
    const selectedIsCaller = searchResult.rawJson.callType === callTypes.caller;
    closeModal();
    if (isCallerType && selectedIsCaller && isCallTypeCaller) {
      updateDraftForm({ callerInformation: searchResult.rawJson.callerInformation });
      navigateToTab('callerInformation');
    } else {
      updateDraftForm({ childInformation: searchResult.rawJson.childInformation });
      navigateToTab('childInformation');
    }
  };

  const onNewCaseSaved = async (caseForm: CaseForm) => {
    await finaliseContact(savedContact, metadata, caseForm);
    await completeTask(task);
  };

  if (
    searchModalOpen &&
    (currentRoute.route === 'search' || currentRoute.route === 'contact' || currentRoute.route === 'case')
  ) {
    return (
      <Search
        task={task}
        currentIsCaller={savedContact?.rawJson?.callType === callTypes.caller}
        handleSelectSearchResult={onSelectSearchResult}
      />
    );
  }

  if (currentRoute.route === 'case') {
    return (
      <CaseLayout>
        <Case task={task} isCreating={true} onNewCaseSaved={onNewCaseSaved} handleClose={closeModal} />
      </CaseLayout>
    );
  }

  if (currentRoute.route === 'contact') {
    return (
      <CaseLayout>
        <ViewContact contactId={currentRoute.id} task={task} />
      </CaseLayout>
    );
  }

  if (currentRoute.route !== 'tabbed-forms') return null;

  if (!currentDefinitionVersion) return null;

  const isCallerType = updatedContact.rawJson.callType === callTypes.caller;

  const handleBackButton = async () => {
    if (!hasTaskControl(task)) return;
    await clearCallType(savedContact);
    backToCallTypeSelect();
  };

  const tabsToIndex = mapTabsToIndex(savedContact, getUnsavedContact(savedContact, draftContact).rawJson);
  const tabs = tabsToIndex.map(mapTabsComponents(methods.errors));

  const handleTabsChange = async (t: number) => {
    const tab = tabsToIndex[t];
    await saveDraft(savedContact, draftContact);
    if (tab === 'search') {
      openSearchModal();
    } else {
      navigateToTab(tab);
    }
  };

  const { subroute, autoFocus } = currentRoute;

  const tabIndex = tabsToIndex.findIndex(t => t === subroute);

  const optionalButtons =
    isOfflineContact(savedContact) && subroute === 'contactlessTask'
      ? [
          {
            label: 'CancelOfflineContact',
            onClick: async () => {
              removeOfflineContact();
            },
          },
        ]
      : undefined;

  const isDataCallType = !isNonDataCallType(callType);
  const showSubmitButton = !isEmptyCallType(callType) && tabIndex === tabs.length - 1;

  // eslint-disable-next-line react/display-name
  const HeaderControlButtons = () => (
    <Box marginTop="10px" marginBottom="10px" paddingLeft="20px">
      <Row>
        <SearchResultsBackButton handleBack={handleBackButton} text={<Template code="TabbedForms-BackButton" />} />
        {csamReportEnabled && (
          <Box marginLeft="auto" marginRight="15px">
            <CSAMReportButton
              csamClcReportEnabled={csamClcReportEnabled}
              csamReportEnabled={csamReportEnabled}
              handleChildCSAMType={() => {
                newCSAMReport(CSAMReportTypes.CHILD);
                openCSAMReport(currentRoute);
              }}
              handleCounsellorCSAMType={() => {
                newCSAMReport(CSAMReportTypes.COUNSELLOR);
                openCSAMReport(currentRoute);
              }}
            />
          </Box>
        )}
      </Row>
    </Box>
  );

  return (
    <FormProvider {...methods}>
      <div role="form" style={{ height: '100%' }}>
        <TabbedFormsContainer>
          {/* Buttons at the top of the form */}
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
          <div style={{ height: '100%', overflow: 'hidden' }}>
            {isOfflineContactTask(task) && (
              <TabbedFormTabContainer display={subroute === 'contactlessTask'}>
                <ContactlessTaskTab
                  task={task}
                  display={subroute === 'contactlessTask'}
                  helplineInformation={currentDefinitionVersion.helplineInformation}
                  definition={currentDefinitionVersion.tabbedForms.ContactlessTaskTab}
                  initialValues={contactlessTask}
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
                  updateForm={values => updateDraftForm({ callerInformation: values.callerInformation })}
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
                    updateForm={values => updateDraftForm({ childInformation: values.childInformation })}
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
                    updateForm={values => updateDraftForm({ caseInformation: values.caseInformation })}
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
              handleSubmitIfValid={methods.handleSubmit} // TODO: this should be used within BottomBar, but that requires a small refactor to make it a functional component
              optionalButtons={optionalButtons}
            />
          </div>
        </TabbedFormsContainer>
      </div>
    </FormProvider>
  );
};

TabbedForms.displayName = 'TabbedForms';

const mapStateToProps = (
  { [namespace]: { routing, activeContacts, configuration } }: RootState,
  { task: { taskSid }, contactId }: OwnProps,
) => {
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskSid);
  const { isCallTypeCaller, existingContacts } = activeContacts;
  const { savedContact, draftContact, metadata } = existingContacts[contactId] || {};
  const baseRoute = getCurrentBaseRoute(routing, taskSid);
  const searchModalOpen =
    isRouteWithModalSupport(baseRoute) && baseRoute.activeModal?.length && baseRoute.activeModal[0].route === 'search';
  const { currentDefinitionVersion } = configuration;
  return {
    currentRoute,
    savedContact,
    draftContact,
    updatedContact: getUnsavedContact(savedContact, draftContact),
    currentDefinitionVersion,
    searchModalOpen,
    isCallTypeCaller,
    metadata,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { contactId, task }: OwnProps) => ({
  updateDraftForm: (form: Partial<ContactRawJson>) => dispatch(updateDraft(contactId, { rawJson: form })),
  saveDraft: (savedContact: Contact, draftContact: ContactDraftChanges) =>
    asyncDispatch(dispatch)(updateContactInHrmAsyncAction(savedContact, draftContact, task.taskSid)),
  clearCallType: (savedContact: Contact) =>
    asyncDispatch(dispatch)(updateContactInHrmAsyncAction(savedContact, { rawJson: { callType: '' } }, task.taskSid)),
  newCSAMReport: (csamReportType: CSAMReportType) =>
    dispatch(newCSAMReportActionForContact(contactId, csamReportType, true)),
  openCSAMReport: (previousRoute: AppRoutes) =>
    dispatch(changeRoute({ route: 'csam-report', subroute: 'form', previousRoute }, task.taskSid)),
  navigateToTab: (tab: TabbedFormSubroutes) =>
    dispatch(
      changeRoute({ route: 'tabbed-forms', subroute: tab, autoFocus: false }, task.taskSid, ChangeRouteMode.Replace),
    ),
  openSearchModal: () => dispatch(newOpenModalAction({ route: 'search', subroute: 'form' }, task.taskSid)),
  openCaseModal: () => dispatch(newOpenModalAction({ route: 'case', subroute: 'home' }, task.taskSid)),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms')),
  backToCallTypeSelect: () =>
    dispatch(changeRoute({ route: 'select-call-type' }, task.taskSid, ChangeRouteMode.Replace)),
  finaliseContact: (contact: Contact, metadata: ContactMetadata, caseForm: CaseForm) =>
    dispatch(submitContactFormAsyncAction(task, contact, metadata, caseForm)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(TabbedForms);

export default connected;
