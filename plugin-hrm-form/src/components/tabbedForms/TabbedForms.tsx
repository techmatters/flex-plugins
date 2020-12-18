/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, ITask, withTaskContext } from '@twilio/flex-ui';
import SearchIcon from '@material-ui/icons/Search';
import { useForm, FormProvider } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { namespace, contactFormsBase, routingBase, RootState } from '../../states';
import { updateCallType, updateForm } from '../../states/contacts/actions';
import { unNestInformation, deTransformValue } from '../../services/ContactService';
import { changeRoute } from '../../states/routing/actions';
import type { TaskEntry } from '../../states/contacts/reducer';
import type { TabbedFormSubroutes } from '../../states/routing/types';
import type { SearchContact } from '../../types/types';
import type { FormDefinition } from '../common/forms/types';
import {
  TabbedFormsContainer,
  TabbedInputsContainer,
  TopNav,
  TransparentButton,
  StyledTabs,
} from '../../styles/HrmStyles';
import FormTab from '../common/forms/FormTab';
import callTypes from '../../states/DomainConstants';
import Search from '../search';
import CallerInformationTab from './CallerInformationTab';
import ChildInformationTab from './ChildInformationTab';
import IssueCategorizationTab from './IssueCategorizationTab';
import CaseInformationTab from './CaseInformationTab';
import ContactlessTaskTab from './ContactlessTaskTab';
import BottomBar from './BottomBar';
import { hasTaskControl } from '../../utils/transfer';
import ChildTabDefinition from '../../formDefinitions/tabbedForms/ChildInformationTab.json';
import CallerTabDefinition from '../../formDefinitions/tabbedForms/CallerInformationTab.json';

// eslint-disable-next-line react/display-name
const mapTabsComponents = (errors: any) => (t: TabbedFormSubroutes) => {
  switch (t) {
    case 'search':
      return <FormTab key="SearchTab" searchTab icon={<SearchIcon />} />;
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

const mapTabsToIndex = (task: ITask, contactForm: TaskEntry): TabbedFormSubroutes[] => {
  const isCallerType = contactForm.callType === callTypes.caller;

  if (task.attributes.isContactlessTask) {
    return isCallerType
      ? ['search', 'contactlessTask', 'callerInformation', 'childInformation', 'categories', 'caseInformation']
      : ['search', 'contactlessTask', 'childInformation', 'categories', 'caseInformation'];
  }

  return isCallerType
    ? ['search', 'callerInformation', 'childInformation', 'categories', 'caseInformation']
    : ['search', 'childInformation', 'categories', 'caseInformation'];
};

type OwnProps = {
  task: ITask;
  handleCompleteTask: any;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedForms: React.FC<Props> = ({ dispatch, routing, contactForm, ...props }) => {
  const methods = useForm({
    defaultValues: contactForm,
    shouldFocusError: false,
    mode: 'onChange',
  });

  if (routing.route !== 'tabbed-forms') return null;

  const { task } = props;
  const taskId = task.taskSid;
  const isCallerType = contactForm.callType === callTypes.caller;

  const onSelectSearchResult = (searchResult: SearchContact) => {
    const selectedIsCaller = searchResult.details.callType === callTypes.caller;
    if (isCallerType && selectedIsCaller) {
      (CallerTabDefinition as FormDefinition).forEach(e => {
        const unNested = unNestInformation(e, searchResult.details.callerInformation);
        const deTransformed = deTransformValue(e)(unNested);
        methods.setValue(`callerInformation.${e.name}`, deTransformed);
      });
      const { callerInformation } = methods.getValues();
      dispatch(updateForm(task.taskSid, 'callerInformation', callerInformation));
      dispatch(changeRoute({ route: 'tabbed-forms', subroute: 'callerInformation' }, taskId));
    } else {
      (ChildTabDefinition as FormDefinition).forEach(e => {
        const unNested = unNestInformation(e, searchResult.details.childInformation);
        const deTransformed = deTransformValue(e)(unNested);
        methods.setValue(`childInformation.${e.name}`, deTransformed);
      });
      const { childInformation } = methods.getValues();
      dispatch(updateForm(task.taskSid, 'childInformation', childInformation));
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
    dispatch(changeRoute({ route: 'tabbed-forms', subroute: tab }, taskId));
  };

  const { subroute } = routing;
  const tabIndex = tabsToIndex.findIndex(t => t === subroute);

  const optionalButtons =
    task.attributes.isContactlessTask && subroute === 'contactlessTask'
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
          <TabbedInputsContainer>
            <TopNav>
              <TransparentButton onClick={handleBackButton}>&lt; BACK</TransparentButton>
            </TopNav>
            <StyledTabs
              name="tab"
              variant="scrollable"
              scrollButtons="auto"
              value={tabIndex}
              onChange={handleTabsChange}
            >
              {tabs}
            </StyledTabs>
            {/* Body */}
            {subroute === 'search' && (
              <Search currentIsCaller={isCallerType} handleSelectSearchResult={onSelectSearchResult} />
            )}
            {task.attributes.isContactlessTask && <ContactlessTaskTab display={subroute === 'contactlessTask'} />}
            {isCallerType && <CallerInformationTab display={subroute === 'callerInformation'} />}
            <ChildInformationTab display={subroute === 'childInformation'} />
            <IssueCategorizationTab display={subroute === 'categories'} />
            <CaseInformationTab display={subroute === 'caseInformation'} />
          </TabbedInputsContainer>
          <BottomBar
            nextTab={() =>
              dispatch(changeRoute({ route: 'tabbed-forms', subroute: tabsToIndex[tabIndex + 1] }, taskId))
            }
            handleCompleteTask={props.handleCompleteTask}
            showNextButton={tabIndex !== 0 && tabIndex < tabs.length - 1}
            showSubmitButton={tabIndex === tabs.length - 1}
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
  return { routing, contactForm };
};

const connector = connect(mapStateToProps);
const connected = connector(TabbedForms);

export default withTaskContext<Props, typeof connected>(connected);
