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
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { FormProvider, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { callTypes } from 'hrm-form-definitions';

import { CaseLayout } from '../../styles/case';
import Case from '../case';
import { configurationBase, contactFormsBase, namespace, RootState, routingBase } from '../../states';
import { updateCallType, updateForm } from '../../states/contacts/actions';
import { searchResultToContactForm } from '../../services/ContactService';
import { removeOfflineContact } from '../../services/formSubmissionHelpers';
import { changeRoute } from '../../states/routing/actions';
import { emptyCategories } from '../../states/contacts/reducer';
import { NewCaseSubroutes, TabbedFormSubroutes } from '../../states/routing/types';
import { ContactRawJson, CustomITask, isOfflineContactTask, HrmServiceContact } from '../../types/types';
import { Box, Row, StyledTabs, TabbedFormsContainer, TabbedFormTabContainer } from '../../styles/HrmStyles';
import FormTab from '../common/forms/FormTab';
import Search from '../search';
import IssueCategorizationSectionForm from '../contact/IssueCategorizationSectionForm';
import ContactDetailsSectionForm from '../contact/ContactDetailsSectionForm';
import ContactlessTaskTab from './ContactlessTaskTab';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import { isNonDataCallType } from '../../states/validationRules';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import CSAMReportButton from './CSAMReportButton';
import CSAMAttachments from './CSAMAttachments';
import { forTask } from '../../states/contacts/issueCategorizationStateApi';
import { newCSAMReportAction } from '../../states/csam-report/actions';
import { CSAMReportTypes } from '../../states/csam-report/types';
// Ensure ww import any custom components that might be used in a form
import '../contact/ResourceReferralList';

// eslint-disable-next-line react/display-name
const mapTabsComponents = (errors: any) => (t: TabbedFormSubroutes) => {
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

const mapTabsToIndex = (task: CustomITask, contactForm: ContactRawJson): TabbedFormSubroutes[] => {
  const isCallerType = contactForm.callType === callTypes.caller;

  if (isOfflineContactTask(task)) {
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
  csamReportEnabled: boolean;
  csamClcReportEnabled: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedForms: React.FC<Props> = ({
  dispatch,
  routing,
  task,
  contact,
  currentDefinitionVersion,
  csamReportEnabled,
  csamClcReportEnabled,
  editContactFormOpen,
  isCallTypeCaller,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const csamAttachments = React.useMemo(() => <CSAMAttachments csamReports={contact.csamReports} />, [
    contact.csamReports,
  ]);

  const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render.

  const { setValue } = methods;
  const {
    helpline,
    rawJson: { callType, callerInformation, childInformation, caseInformation, contactlessTask },
  } = contact;

  /**
   * Clear some parts of the form state when helpline changes.
   */
  React.useEffect(() => {
    if (isMounted.current) setValue('categories', emptyCategories);
    else isMounted.current = true;
  }, [helpline, setValue]);

  if (routing.route !== 'tabbed-forms') return null;

  if (!currentDefinitionVersion) return null;

  const taskId = task.taskSid;
  const isCallerType = contact.rawJson.callType === callTypes.caller;

  const onSelectSearchResult = (searchResult: HrmServiceContact) => {
    const selectedIsCaller = searchResult.rawJson.callType === callTypes.caller;
    if (isCallerType && selectedIsCaller && isCallTypeCaller) {
      const deTransformed = searchResultToContactForm(
        currentDefinitionVersion.tabbedForms.CallerInformationTab,
        searchResult.rawJson.callerInformation,
      );

      dispatch(updateForm(task.taskSid, 'callerInformation', deTransformed));
      dispatch(changeRoute({ route: 'tabbed-forms', subroute: 'callerInformation' }, taskId));
    } else {
      const deTransformed = searchResultToContactForm(
        currentDefinitionVersion.tabbedForms.ChildInformationTab,
        searchResult.rawJson.childInformation,
      );

      dispatch(updateForm(task.taskSid, 'childInformation', deTransformed));
      dispatch(changeRoute({ route: 'tabbed-forms', subroute: 'childInformation' }, taskId));
    }
  };

  const handleBackButton = () => {
    if (!hasTaskControl(task)) return;

    dispatch(updateCallType(taskId, ''));
    dispatch(changeRoute({ route: 'select-call-type' }, taskId));
  };

  const tabsToIndex = mapTabsToIndex(task, contact.rawJson);
  const tabs = tabsToIndex.map(mapTabsComponents(methods.errors));

  const handleTabsChange = (_event: any, t: number) => {
    const tab = tabsToIndex[t];
    dispatch(changeRoute({ route: 'tabbed-forms', subroute: tab, autoFocus: false }, taskId));
  };

  const { subroute, autoFocus } = routing;
  let tabIndex = tabsToIndex.findIndex(t => t === subroute);

  // If the subroute is any from 'new case' we should focus on 'Search' tab and display the entire Case inside TabbedForms.
  if (Object.values(NewCaseSubroutes).some(r => r === subroute)) {
    tabIndex = tabsToIndex.findIndex(t => t === 'search');
    return (
      <CaseLayout>
        <Case task={task} isCreating={false} />
      </CaseLayout>
    );
  }

  const optionalButtons =
    isOfflineContactTask(task) && subroute === 'contactlessTask'
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
    <Box className="hiddenWhenEditingContact" marginTop="10px" marginBottom="10px" paddingLeft="20px">
      <Row>
        <SearchResultsBackButton handleBack={handleBackButton} text={<Template code="TabbedForms-BackButton" />} />
        {csamReportEnabled && (
          <Box marginLeft="auto" marginRight="15px">
            <CSAMReportButton
              csamClcReportEnabled={csamClcReportEnabled}
              csamReportEnabled={csamReportEnabled}
              handleChildCSAMType={() => {
                dispatch(newCSAMReportAction(taskId, CSAMReportTypes.CHILD, true));
                dispatch(changeRoute({ route: 'csam-report', subroute: 'form', previousRoute: routing }, taskId));
              }}
              handleCounsellorCSAMType={() => {
                dispatch(newCSAMReportAction(taskId, CSAMReportTypes.COUNSELLOR, true));
                dispatch(changeRoute({ route: 'csam-report', subroute: 'form', previousRoute: routing }, taskId));
              }}
            />
          </Box>
        )}
      </Row>
    </Box>
  );
  return (
    <FormProvider {...methods}>
      <div role="form" style={{ height: '100%' }} className={editContactFormOpen ? 'editingContact' : ''}>
        <TabbedFormsContainer>
          {/* Buttons at the top of the form */}
          <HeaderControlButtons />
          <StyledTabs
            className="hiddenWhenEditingContact"
            name="tab"
            variant="scrollable"
            scrollButtons="auto"
            value={tabIndex}
            onChange={handleTabsChange}
          >
            {tabs}
          </StyledTabs>
          {subroute === 'search' ? (
            <Search task={task} currentIsCaller={isCallerType} handleSelectSearchResult={onSelectSearchResult} />
          ) : (
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
                    updateFormActionDispatcher={dispatch => values =>
                      dispatch(updateForm(task.taskSid, 'callerInformation', values.callerInformation))}
                    taskSid={taskId}
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
                      updateFormActionDispatcher={dispatch => values =>
                        dispatch(updateForm(task.taskSid, 'childInformation', values.childInformation))}
                      taskSid={taskId}
                    />
                  </TabbedFormTabContainer>
                  <TabbedFormTabContainer display={subroute === 'categories'}>
                    <IssueCategorizationSectionForm
                      stateApi={forTask(task)}
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
                      updateFormActionDispatcher={dispatch => values =>
                        dispatch(updateForm(task.taskSid, 'caseInformation', values.caseInformation))}
                      taskSid={taskId}
                    />
                  </TabbedFormTabContainer>
                </>
              )}
            </div>
          )}
          <div className="hiddenWhenEditingContact">
            <BottomBar
              task={task}
              nextTab={() =>
                dispatch(
                  changeRoute({ route: 'tabbed-forms', subroute: tabsToIndex[tabIndex + 1], autoFocus: true }, taskId),
                )
              }
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

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const routing = state[namespace][routingBase].tasks[ownProps.task.taskSid];
  const { contact } = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid] ?? {};
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { isCallTypeCaller } = state[namespace][contactFormsBase];
  return {
    routing,
    contact,
    currentDefinitionVersion,
    editContactFormOpen,
    isCallTypeCaller,
  };
};

const connector = connect(mapStateToProps);
const connected = connector(TabbedForms);

export default connected;
