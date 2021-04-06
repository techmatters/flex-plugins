/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';

import { CustomITask } from '../types/types';
import { searchContacts as searchContactsAction, searchCases as searchCasesAction } from '../states/search/actions';
import { namespace, searchContactsBase, configurationBase, RootState } from '../states';
import { getNumberFromTask } from '../services/ContactService';
import { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './search/SearchResults';
import { YellowBanner, Bold } from '../styles/previousContactsBanner';
import { StyledLink } from '../styles/search';
import { ChannelTypes, channelTypes } from '../states/DomainConstants';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const localizedSource: { [channelType in ChannelTypes]: string } = {
  [channelTypes.web]: 'PreviousContacts-IPAddress',
  [channelTypes.voice]: 'PreviousContacts-PhoneNumber',
  [channelTypes.sms]: 'PreviousContacts-PhoneNumber',
  [channelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
  [channelTypes.facebook]: 'PreviousContacts-FacebookUser',
};

const PreviousContactsBanner: React.FC<Props> = ({
  task,
  counselorsHash,
  searchContactsResults,
  searchCasesResults,
  searchContacts,
  searchCases,
}) => {
  useEffect(() => {
    if (task && task.attributes && !task.attributes.isContactlessTask) {
      const contactNumber = getNumberFromTask(task as ITask);
      const isTraceableNumber = ![null, undefined, 'Anonymous'].includes(contactNumber);

      if (isTraceableNumber) {
        const searchParams = { contactNumber };
        searchContacts(searchParams, counselorsHash, CONTACTS_PER_PAGE, 0);
        searchCases(searchParams, counselorsHash, CASES_PER_PAGE, 0);
      }
    }
  }, [task, counselorsHash, searchContacts, searchCases]);

  const { count: contactsCount } = searchContactsResults;
  const { count: casesCount } = searchCasesResults;

  if (contactsCount === 0 && casesCount === 0) return null;

  return (
    <YellowBanner>
      {/* eslint-disable-next-line prettier/prettier */}
      <pre><Template code="PreviousContacts-ThereAre" /> <Bold>{contactsCount} <Template code="PreviousContacts-PreviousContacts" /></Bold> and <Bold>{casesCount} <Template code="PreviousContacts-Cases" /></Bold> <Template code="PreviousContacts-FromThis" /> <Template code={localizedSource[task.channelType]} />.</pre>
      <StyledLink onClick={() => null}>
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
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    searchContactsResults: taskSearchState.searchContactsResult,
    searchCasesResults: taskSearchState.searchCasesResult,
    counselorsHash: counselors.hash,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    searchContacts: searchContactsAction(dispatch)(taskId),
    searchCases: searchCasesAction(dispatch)(taskId),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviousContactsBanner);
