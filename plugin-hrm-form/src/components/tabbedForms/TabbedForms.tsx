/* eslint-disable react/prop-types */
/* eslint-disable multiline-comment-style */
import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Search';
import { FormProvider, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import { TabbedFormsContainer, TopNav, TransparentButton, StyledTabs } from '../../styles/HrmStyles';
import callTypes from '../../states/DomainConstants';
import { formType, taskType } from '../../types';
import Search from '../search';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import FormTab from '../common/forms/FormTab';
import CustomChildForm from '../common/forms/CustomChildForm';
import CustomCallerForm from '../common/forms/CustomCallerForm';
import CustomCategoriesForm from '../common/forms/CustomCategoriesForm';
import { namespace, contactsBase } from '../../states';

const TabbedForms = props => {
  const methods = useForm({ defaultValues: props.contactForm, shouldFocusError: false });

  const { task, form } = props;
  const taskId = task.taskSid;

  const handleSelectSearchResult = searchResult => {
    props.handleSelectSearchResult(searchResult, taskId);

    // Redirects to the tab where data is being copied to
    const currentIsCaller = form.callType.value === callTypes.caller;
    const selectedIsChild = searchResult.details.callType === callTypes.child;
    const tab = currentIsCaller && selectedIsChild ? 2 : 1;

    props.changeTab(tab, taskId);
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

  const onSubmit = data => console.log(data);

  console.log(methods.errors, methods.getValues());
  const { errors } = methods;

  const tabs = [
    <FormTab key="SearchTab" searchTab icon={<SearchIcon />} />,
    isCallerType ? (
      <FormTab key="CallerInfoTabTab" label="TabbedForms-AddCallerInfoTab" error={errors.callerInformation} />
    ) : null,
    <FormTab key="ChildInfoTabTab" label="TabbedForms-AddChildInfoTab" error={errors.childInformation} />,
    <FormTab key="CategoriesTab" label="TabbedForms-CategoriesTab" error={errors.categories} />,
    <FormTab key="CaseInfoTabTab" label="TabbedForms-AddCaseInfoTab" error={errors.caseInformation} />,
  ].filter(t => t); // filter the ones that might be null

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <TabbedFormsContainer>
          <TopNav>
            <TransparentButton onClick={handleBackButton}>&lt; BACK</TransparentButton>
          </TopNav>
          <StyledTabs name="tab" variant="scrollable" scrollButtons="auto" value={tab} onChange={handleTabsChange}>
            {tabs}
          </StyledTabs>
          {/* Body */}
          {tab === 0 && <Search currentIsCaller={isCallerType} handleSelectSearchResult={handleSelectSearchResult} />}
          {isCallerType && <CustomCallerForm display={isCallerType && tab === 1} />}
          <CustomChildForm display={isCallerType ? tab === 2 : tab === 1} />
          <CustomCategoriesForm display={isCallerType ? tab === 3 : tab === 2} />

          <button type="button" onClick={() => methods.trigger()}>
            Validate whenever we want
          </button>
          <input type="submit" />

          <BottomBar
            tabs={tabs.length}
            form={form}
            changeTab={props.changeTab}
            handleCompleteTask={props.handleCompleteTask}
            handleValidateForm={props.handleValidateForm}
          />
        </TabbedFormsContainer>
      </form>
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
};

const mapStateToProps = (state, ownProps) => ({
  contactForm: state[namespace][contactsBase].tasks[ownProps.task.taskSid],
});

export default withTaskContext(connect(mapStateToProps)(TabbedForms));
