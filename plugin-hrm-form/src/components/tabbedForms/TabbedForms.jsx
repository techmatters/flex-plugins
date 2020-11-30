import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext, Template, Actions } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Search';
import { useForm, FormProvider } from 'react-hook-form';
import { connect } from 'react-redux';

import { namespace, contactFormsBase } from '../../states';
import { TabbedFormsContainer, TopNav, TransparentButton, StyledTabs, StyledTab } from '../../styles/HrmStyles';
import FormTab from '../common/forms/FormTab';
import callTypes from '../../states/DomainConstants';
import decorateTab from '../decorateTab';
import { formType, taskType } from '../../types';
import Search from '../search';
import CallerInformationTab from './CallerInformationTab';
import ChildInformationTab from './ChildInformationTab';
import IssueCategorizationTab from './IssueCategorizationTab';
import CaseInformationTab from './CaseInformationTab';
import ContactlessTaskTab from './ContactlessTaskTab';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';

const TabbedForms = props => {
  const initialValues = { contactlessTask: props.contactForm.contactlessTask };
  const methods = useForm({
    defaultValues: initialValues,
    shouldFocusError: false,
    shouldUnregister: false,
  });

  const { task, form } = props;
  const taskId = task.taskSid;

  const curriedHandleChange = (parents, name) => e => {
    if (hasTaskControl(task)) props.handleChange(taskId, parents, name, e.target.value || e.currentTarget.value);
  };

  const curriedHandleFocus = (parents, name) => () => props.handleFocus(taskId, parents, name);

  const defaultEventHandlers = (parents, name) => ({
    handleBlur: props.handleBlur,
    handleChange: curriedHandleChange(parents, name),
    handleFocus: curriedHandleFocus(parents, name),
  });

  const handleSelectSearchResult = searchResult => {
    props.handleSelectSearchResult(searchResult, taskId);

    // Redirects to the tab where data is being copied to
    const currentIsCaller = form.callType.value === callTypes.caller;
    const selectedIsChild = searchResult.details.callType === callTypes.child;
    const tab = currentIsCaller && selectedIsChild ? 2 : 1;

    props.changeTab(tab, taskId);
  };

  const handleCheckboxClick = (parents, name, value) => {
    if (hasTaskControl(task)) props.handleChange(taskId, parents, name, value);
  };

  const handleCategoryToggle = (taskSID, category, subcategory, newValue) => {
    if (hasTaskControl(task)) props.handleCategoryToggle(taskSID, category, subcategory, newValue);
  };

  const handleTabsChange = (event, tab) => {
    props.changeTab(tab, taskId);
  };

  const handleBackButton = () => {
    if (!hasTaskControl(task)) return;

    props.handleCallTypeButtonClick(taskId, '');
    props.changeRoute({ route: 'select-call-type' }, taskId);
  };

  const { tab } = form.metadata;
  const isCallerType = form.callType.value === callTypes.caller;

  const body = [];

  body.push(
    <Search
      currentIsCaller={isCallerType}
      handleSelectSearchResult={searchResult => handleSelectSearchResult(searchResult)}
    />,
  );

  if (task.attributes.isContactlessTask) body.push(<div style={{ display: 'none' }} />); // fake it so length is accurate

  if (isCallerType) {
    body.push(
      <CallerInformationTab callerInformation={form.callerInformation} defaultEventHandlers={defaultEventHandlers} />,
    );
  }

  body.push(
    <ChildInformationTab
      childInformation={form.childInformation}
      handleCheckboxClick={handleCheckboxClick}
      defaultEventHandlers={defaultEventHandlers}
    />,
  );

  body.push(<IssueCategorizationTab form={form} taskId={taskId} handleCategoryToggle={handleCategoryToggle} />);

  body.push(
    <CaseInformationTab
      caseInformation={form.caseInformation}
      handleCheckboxClick={handleCheckboxClick}
      defaultEventHandlers={defaultEventHandlers}
    />,
  );

  const tabs = [];
  tabs.push(<StyledTab searchTab key="Search" icon={<SearchIcon />} />);
  if (task.attributes.isContactlessTask)
    tabs.push(
      <FormTab
        key="Contact Information"
        label="TabbedForms-AddContactInfoTab"
        error={methods.errors.contactlessTask}
      />,
    );
  if (isCallerType) {
    tabs.push(decorateTab('TabbedForms-AddCallerInfoTab', form.callerInformation));
  }
  tabs.push(decorateTab('TabbedForms-AddChildInfoTab', form.childInformation));
  tabs.push(decorateTab('TabbedForms-CategoriesTab', form.caseInformation.categories));
  tabs.push(<StyledTab key="Case Information" label={<Template code="TabbedForms-AddCaseInfoTab" />} />);

  const optionalButtons =
    task.attributes.isContactlessTask && tab === 1
      ? [
          {
            label: 'CancelOfflineContact',
            onClick: async () => {
              const { isContactlessTask, ...rest } = task.attributes;
              await task.setAttributes(rest); // skip insights override
              Actions.invokeAction('CompleteTask', { task });
            },
          },
        ]
      : undefined;

  return (
    <FormProvider {...methods}>
      <div role="form" style={{ height: '100%' }}>
        <TabbedFormsContainer>
          <TopNav>
            <TransparentButton onClick={handleBackButton}>&lt; BACK</TransparentButton>
          </TopNav>
          <StyledTabs name="tab" variant="scrollable" scrollButtons="auto" value={tab} onChange={handleTabsChange}>
            {tabs}
          </StyledTabs>
          {task.attributes.isContactlessTask && <ContactlessTaskTab display={tab === 1} />}
          {body[tab]}
          <BottomBar
            tabs={tabs.length}
            form={form}
            changeTab={props.changeTab}
            handleCompleteTask={props.handleCompleteTask}
            handleValidateForm={props.handleValidateForm}
            handleSubmitIfValid={methods.handleSubmit} // TODO: this should be used within BottomBar, but that requires a small refactor to make it a functional component
            optionalButtons={optionalButtons}
          />
        </TabbedFormsContainer>
      </div>
    </FormProvider>
  );
};

TabbedForms.displayName = 'TabbedForms';
TabbedForms.propTypes = {
  form: formType.isRequired,
  task: taskType.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
  changeTab: PropTypes.func.isRequired,
  changeRoute: PropTypes.func.isRequired,
  handleValidateForm: PropTypes.func.isRequired,
  contactForm: PropTypes.shape({ contactlessTask: PropTypes.shape({}) }).isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  return { contactForm };
};

const connector = connect(mapStateToProps);
const connected = connector(TabbedForms);

export default withTaskContext(connected);
