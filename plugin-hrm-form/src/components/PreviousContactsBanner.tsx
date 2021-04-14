/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ITask, Template } from '@twilio/flex-ui';

import { CustomITask } from '../types/types';
import {
  searchContacts as searchContactsAction,
  searchCases as searchCasesAction,
  handleSearchFormChange as handleSearchFormChangeAction,
  changeSearchPage as changeSearchPageAction,
} from '../states/search/actions';
import { namespace, searchContactsBase, configurationBase, RootState } from '../states';
import { getNumberFromTask } from '../services/ContactService';
import { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './search/SearchResults';
import { YellowBanner } from '../styles/previousContactsBanner';
import { Bold } from '../styles/HrmStyles';
import { StyledLink } from '../styles/search';
import { ChannelTypes, channelTypes } from '../states/DomainConstants';
import { changeRoute as changeRouteAction } from '../states/routing/actions';
import { SearchPages } from '../states/search/types';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export const localizedSource: { [channelType in ChannelTypes]: string } = {
  [channelTypes.web]: 'PreviousContacts-IPAddress',
  [channelTypes.voice]: 'PreviousContacts-PhoneNumber',
  [channelTypes.sms]: 'PreviousContacts-PhoneNumber',
  [channelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
  [channelTypes.facebook]: 'PreviousContacts-FacebookUser',
};

const PreviousContactsBanner: React.FC<Props> = ({
  task,
  counselorsHash,
  previousContacts,
  searchContacts,
  searchCases,
  changeRoute,
  handleSearchFormChange,
  changeSearchPage,
}) => {
  useEffect(() => {
    if (task && task.attributes && !task.attributes.isContactlessTask && previousContacts === undefined) {
      const contactNumber = getNumberFromTask(task as ITask);
      const isTraceableNumber = ![null, undefined, 'Anonymous'].includes(contactNumber);

      if (isTraceableNumber) {
        const searchParams = { contactNumber };
        searchContacts(searchParams, counselorsHash, CONTACTS_PER_PAGE, 0, true);
        searchCases(searchParams, counselorsHash, CASES_PER_PAGE, 0, true);
      }
    }
  }, [task, counselorsHash, searchContacts, searchCases, previousContacts]);

  const shouldDisplayBanner =
    previousContacts && (previousContacts.contactsCount > 0 || previousContacts.casesCount > 0);

  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = () => {
    const contactNumber = getNumberFromTask(task as ITask);
    const searchParams = { contactNumber };
    searchContacts(searchParams, counselorsHash, CONTACTS_PER_PAGE, 0);
    searchCases(searchParams, counselorsHash, CASES_PER_PAGE, 0);
    changeSearchPage(SearchPages.resultsContacts);
    handleSearchFormChange('contactNumber', contactNumber);
    changeRoute({ route: 'tabbed-forms', subroute: 'search' });
  };

  const { contactsCount, casesCount } = previousContacts;

  return (
    <YellowBanner data-testid="PreviousContacts-Container">
      {/* eslint-disable-next-line prettier/prettier */}
      <pre><Template code="PreviousContacts-ThereAre" /> <Bold>{contactsCount} <Template code="PreviousContacts-PreviousContacts" /></Bold> and <Bold>{casesCount} <Template code="PreviousContacts-Cases" /></Bold> <Template code="PreviousContacts-FromThis" /> <Template code={localizedSource[task.channelType]} />.</pre>
      <StyledLink onClick={handleClickViewRecords}>
        <Template code="PreviousContacts-ViewRecords" />
      </StyledLink>
    </YellowBanner>
  );
};

PreviousContactsBanner.displayName = 'PreviousContactsBanner';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];
  const { counselors } = state[namespace][configurationBase];

  return {
    previousContacts: taskSearchState.previousContacts,
    counselorsHash: counselors.hash,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    searchContacts: searchContactsAction(dispatch)(taskId),
    searchCases: searchCasesAction(dispatch)(taskId),
    changeRoute: routing => dispatch(changeRouteAction(routing, taskId)),
    handleSearchFormChange: bindActionCreators(handleSearchFormChangeAction(taskId), dispatch),
    changeSearchPage: bindActionCreators(changeSearchPageAction(taskId), dispatch),
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
export default connect(mapStateToProps, mapDispatchToProps)(PreviousContactsBanner);
