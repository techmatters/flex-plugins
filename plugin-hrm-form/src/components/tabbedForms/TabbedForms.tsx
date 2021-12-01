/* eslint-disable react/no-multi-comp */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/prop-types */
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { useForm, FormProvider } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { CaseLayout } from '../../styles/case';
import Case from '../case';
import { namespace, contactFormsBase, routingBase, RootState, configurationBase } from '../../states';
import { updateCallType, updateForm } from '../../states/contacts/actions';
import { searchResultToContactForm } from '../../services/ContactService';
import { removeOfflineContact } from '../../services/formSubmissionHelpers';
import { changeRoute } from '../../states/routing/actions';
import { TaskEntry, emptyCategories } from '../../states/contacts/reducer';
import { TabbedFormSubroutes, NewCaseSubroutes } from '../../states/routing/types';
import { CustomITask, isOfflineContactTask, SearchContact } from '../../types/types';
import { TabbedFormsContainer, Box, StyledTabs, Row } from '../../styles/HrmStyles';
import FormTab from '../common/forms/FormTab';
import callTypes from '../../states/DomainConstants';
import Search from '../search';
import IssueCategorizationTab from './IssueCategorizationTab';
import TabbedFormTab from './TabbedFormTab';
import ContactlessTaskTab from './ContactlessTaskTab';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import { isNonDataCallType } from '../../states/ValidationRules';
import SearchResultsBackButton from '../search/SearchResults/SearchResultsBackButton';
import CSAMReportButton from './CSAMReportButton';
import CSAMAttachments from './CSAMAttachments';

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

const mapTabsToIndex = (task: CustomITask, contactForm: TaskEntry): TabbedFormSubroutes[] => {
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
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedForms: React.FC<Props> = ({
  dispatch,
  routing,
  task,
  contactForm,
  currentDefinitionVersion,
  csamReportEnabled,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const csamAttachments = React.useMemo(() => <CSAMAttachments csamReports={contactForm.csamReports} />, [
    contactForm.csamReports,
  ]);

  const isMounted = React.useRef(false); // mutable value to avoid reseting the state in the first render.

  const { setValue } = methods;
  const { helpline } = contactForm;

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
  const isCallerType = contactForm.callType === callTypes.caller;

  const onSelectSearchResult = (searchResult: SearchContact) => {
    const selectedIsCaller = searchResult.details.callType === callTypes.caller;
    if (isCallerType && selectedIsCaller) {
      const deTransformed = searchResultToContactForm(
        currentDefinitionVersion.tabbedForms.CallerInformationTab,
        searchResult.details.callerInformation,
      );

      dispatch(updateForm(task.taskSid, 'callerInformation', deTransformed));
      dispatch(changeRoute({ route: 'tabbed-forms', subroute: 'callerInformation' }, taskId));
    } else {
      const deTransformed = searchResultToContactForm(
        currentDefinitionVersion.tabbedForms.ChildInformationTab,
        searchResult.details.childInformation,
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

  const tabsToIndex = mapTabsToIndex(task, contactForm);
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

  const isDataCallType = !isNonDataCallType(contactForm.callType);
  const showSubmitButton = !isEmptyCallType(contactForm.callType) && tabIndex === tabs.length - 1;

  // eslint-disable-next-line react/display-name
  const HeaderControlButtons = () => (
    <Box marginTop="10px" marginBottom="10px" paddingLeft="20px">
      <Row>
        <SearchResultsBackButton handleBack={handleBackButton} text={<Template code="TabbedForms-BackButton" />} />
        {csamReportEnabled && (
          <Box marginLeft="auto">
            <CSAMReportButton
              handleClick={() => dispatch(changeRoute({ route: 'csam-report', subroute: 'form' }, taskId))}
            />
          </Box>
        )}
      </Row>
    </Box>
  );

  return (
    <FormProvider {...methods}>
      <div role="form" style={{ height: '100%', overflow: 'scroll' }}>
        <TabbedFormsContainer>
          {/* Buttons at the top of the form */}
          <HeaderControlButtons />

          <StyledTabs name="tab" variant="scrollable" scrollButtons="auto" value={tabIndex} onChange={handleTabsChange}>
            {tabs}
          </StyledTabs>
          {subroute === 'search' ? (
            <Search task={task} currentIsCaller={isCallerType} handleSelectSearchResult={onSelectSearchResult} />
          ) : (
            <div style={{ height: '100%', overflow: 'hidden' }}>
              {isOfflineContactTask(task) && (
                <ContactlessTaskTab
                  task={task}
                  display={subroute === 'contactlessTask'}
                  definition={currentDefinitionVersion.helplineInformation}
                  initialValues={contactForm.contactlessTask}
                  autoFocus={autoFocus}
                />
              )}
              {isCallerType && (
                <TabbedFormTab
                  task={task}
                  tabPath="callerInformation"
                  definition={currentDefinitionVersion.tabbedForms.CallerInformationTab}
                  layoutDefinition={currentDefinitionVersion.layoutVersion.contact.callerInformation}
                  initialValues={contactForm.callerInformation}
                  display={subroute === 'callerInformation'}
                  autoFocus={autoFocus}
                />
              )}
              {isDataCallType && (
                <>
                  <TabbedFormTab
                    task={task}
                    tabPath="childInformation"
                    definition={currentDefinitionVersion.tabbedForms.ChildInformationTab}
                    layoutDefinition={currentDefinitionVersion.layoutVersion.contact.childInformation}
                    initialValues={contactForm.childInformation}
                    display={subroute === 'childInformation'}
                    autoFocus={autoFocus}
                  />
                  <IssueCategorizationTab
                    task={task}
                    display={subroute === 'categories'}
                    initialValue={contactForm.categories}
                    definition={currentDefinitionVersion.tabbedForms.IssueCategorizationTab(helpline)}
                    autoFocus={autoFocus}
                  />
                  <TabbedFormTab
                    task={task}
                    tabPath="caseInformation"
                    definition={currentDefinitionVersion.tabbedForms.CaseInformationTab}
                    layoutDefinition={currentDefinitionVersion.layoutVersion.contact.caseInformation}
                    initialValues={contactForm.caseInformation}
                    display={subroute === 'caseInformation'}
                    autoFocus={autoFocus}
                    extraChildrenRight={csamAttachments}
                  />
                </>
              )}
            </div>
          )}
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
        </TabbedFormsContainer>
      </div>
    </FormProvider>
  );
};

TabbedForms.displayName = 'TabbedForms';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const routing = state[namespace][routingBase].tasks[ownProps.task.taskSid];
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  return { routing, contactForm, currentDefinitionVersion };
};

const connector = connect(mapStateToProps);
const connected = connector(TabbedForms);

export default connected;
