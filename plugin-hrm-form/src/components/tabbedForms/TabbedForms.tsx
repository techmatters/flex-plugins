/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Search';
import { FormProvider, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { TabbedFormsContainer, TopNav, TransparentButton, StyledTabs } from '../../styles/HrmStyles';
import callTypes from '../../states/DomainConstants';
import Search from '../search';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import FormTab from '../common/forms/FormTab';
import CustomChildForm from '../common/forms/CustomChildForm';
import CustomCallerForm from '../common/forms/CustomCallerForm';
import CustomCategoriesForm from '../common/forms/CustomCategoriesForm';
import CustomCaseInfoForm from '../common/forms/CustomCaseInfoForm';
import { namespace, contactsBase, routingBase, RootState } from '../../states';
import { updateCallType } from '../../states/contacts/actions';
import { changeRoute } from '../../states/routing/actions';
import type { TabbedFormSubroutes } from '../../states/routing/types';

// eslint-disable-next-line react/display-name
const mapTabsComponents = (errors: any) => (t: TabbedFormSubroutes) => {
  switch (t) {
    case 'search':
      return <FormTab key="SearchTab" searchTab icon={<SearchIcon />} />;
    case 'callerInformation':
      return <FormTab key="CallerInfoTabTab" label="TabbedForms-AddCallerInfoTab" error={errors.callerInformation} />;
    case 'childInformation':
      return <FormTab key="ChildInfoTabTab" label="TabbedForms-AddChildInfoTab" error={errors.childInformation} />;
    case 'categories':
      return <FormTab key="CategoriesTab" label="TabbedForms-CategoriesTab" error={errors.categories} />;
    case 'caseInformation':
      return <FormTab key="CaseInfoTabTab" label="TabbedForms-AddCaseInfoTab" error={errors.caseInformation} />;
    default:
      return null;
  }
};

type OwnProps = {
  task: ITask;

  handleCompleteTask: any;
  handleSelectSearchResult: any;
  handleValidateForm: any;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedForms: React.FC<Props> = ({ dispatch, routing, contactForm, ...props }) => {
  const methods = useForm({ defaultValues: contactForm, shouldFocusError: false });

  console.log(methods.errors, methods.getValues());

  if (routing.route !== 'tabbed-forms') return null;

  const { task } = props;
  const taskId = task.taskSid;
  const isCallerType = contactForm.callType === callTypes.caller;

  const handleSelectSearchResult = searchResult => {
    props.handleSelectSearchResult(searchResult, taskId);

    // Redirects to the tab where data is being copied to
    const selectedIsChild = searchResult.details.callType === callTypes.child;
    const subroute: TabbedFormSubroutes = isCallerType && selectedIsChild ? 'childInformation' : 'callerInformation';
    dispatch(changeRoute({ route: 'tabbed-forms', subroute }, taskId));
  };

  const handleBackButton = () => {
    if (!hasTaskControl(task)) return;

    dispatch(updateCallType(taskId, ''));
    dispatch(changeRoute({ route: 'select-call-type' }, taskId));
  };

  const mapTabsToIndex: TabbedFormSubroutes[] = isCallerType
    ? ['search', 'callerInformation', 'childInformation', 'categories', 'caseInformation']
    : ['search', 'childInformation', 'categories', 'caseInformation'];

  const tabs = mapTabsToIndex.map(mapTabsComponents(methods.errors));

  const handleTabsChange = (event: any, t: number) => {
    console.log('>>> routing.subroute', routing.subroute);
    /*
     * validate current tab before changing
     * if (routing.subroute !== 'search') methods.trigger(routing.subroute);
     */

    const tab = mapTabsToIndex[t];
    dispatch(changeRoute({ route: 'tabbed-forms', subroute: tab }, taskId));
  };

  const { subroute } = routing;
  const tabIndex = mapTabsToIndex.findIndex(t => t === subroute);

  return (
    <FormProvider {...methods}>
      <form style={{ height: '100%' }}>
        <TabbedFormsContainer>
          <TopNav>
            <TransparentButton onClick={handleBackButton}>&lt; BACK</TransparentButton>
          </TopNav>
          <StyledTabs name="tab" variant="scrollable" scrollButtons="auto" value={tabIndex} onChange={handleTabsChange}>
            {tabs}
          </StyledTabs>
          {/* Body */}
          {subroute === 'search' && (
            <Search currentIsCaller={isCallerType} handleSelectSearchResult={handleSelectSearchResult} />
          )}
          {isCallerType && <CustomCallerForm display={isCallerType && subroute === 'callerInformation'} />}
          <CustomChildForm display={subroute === 'childInformation'} />
          <CustomCategoriesForm display={subroute === 'categories'} />
          <CustomCaseInfoForm display={subroute === 'caseInformation'} />

          <button type="button" onClick={() => methods.trigger()}>
            Validate whenever we want
          </button>
          <input type="submit" />

          <BottomBar
            nextTab={() =>
              dispatch(changeRoute({ route: 'tabbed-forms', subroute: mapTabsToIndex[tabIndex + 1] }, taskId))
            }
            handleCompleteTask={props.handleCompleteTask}
            handleValidateForm={methods.handleSubmit}
            showNextButton={tabIndex !== 0 && tabIndex < tabs.length - 1}
            showSubmitButton={tabIndex === tabs.length - 1}
          />
        </TabbedFormsContainer>
      </form>
    </FormProvider>
  );
};

TabbedForms.displayName = 'TabbedForms';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const routing = state[namespace][routingBase].tasks[ownProps.task.taskSid];
  const contactForm = state[namespace][contactsBase].tasks[ownProps.task.taskSid];
  return { routing, contactForm };
};

const connector = connect(mapStateToProps);
const connected = connector(TabbedForms);

export default withTaskContext<Props, typeof connected>(connected);
