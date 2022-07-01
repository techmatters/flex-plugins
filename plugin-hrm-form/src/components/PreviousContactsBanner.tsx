/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { CustomITask, isTwilioTask } from '../types/types';
import {
  viewPreviousContacts as viewPreviousContactsAction,
  searchContacts as searchContactsAction,
  searchCases as searchCasesAction,
} from '../states/search/actions';
import { namespace, searchContactsBase, configurationBase, RootState, contactFormsBase } from '../states';
import { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './search/SearchResults';
import { YellowBanner } from '../styles/previousContactsBanner';
import { Bold } from '../styles/HrmStyles';
import { StyledLink } from '../styles/search';
import { ChannelTypes, channelTypes } from '../states/DomainConstants';
import { changeRoute as changeRouteAction } from '../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask } from '../utils/task';

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
  [channelTypes.twitter]: 'PreviousContacts-TwitterUser',
  [channelTypes.instagram]: 'PreviousContacts-InstagramUser',
};

const PreviousContactsBanner: React.FC<Props> = ({
  task,
  counselorsHash,
  previousContacts,
  viewPreviousContacts,
  searchContacts,
  searchCases,
  changeRoute,
  editContactFormOpen,
}) => {
  useEffect(() => {
    if (isTwilioTask(task) && previousContacts === undefined) {
      const contactNumber = getNumberFromTask(task);
      const isTraceableNumber = ![null, undefined, '', 'Anonymous'].includes(contactNumber);

      if (isTraceableNumber) {
        const searchParams = { contactNumber };
        searchContacts(searchParams, counselorsHash, CONTACTS_PER_PAGE, 0, true);
        searchCases(searchParams, counselorsHash, CASES_PER_PAGE, 0, true);
      }
    }
  }, [task, counselorsHash, searchContacts, searchCases, previousContacts]);

  const contactsCount = previousContacts?.contacts?.count || 0;
  const casesCount = previousContacts?.cases?.count || 0;
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;

  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = () => {
    viewPreviousContacts();
    changeRoute({ route: 'tabbed-forms', subroute: 'search' });
  };

  const contactIdentifier = getFormattedNumberFromTask(task);
  return (
    <div className={editContactFormOpen ? 'editingContact' : ''}>
      <YellowBanner data-testid="PreviousContacts-Container" className="hiddenWhenEditingContact">
        {/* eslint-disable-next-line prettier/prettier */}
      <pre>
          <Template code="PreviousContacts-ThereAre" />
          &nbsp;
          {contactsCount === 1 ? (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContact" />
            </Bold>
          ) : (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContacts" />
            </Bold>
          )}
          &nbsp;and&nbsp;
          {casesCount === 1 ? (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Case" />
            </Bold>
          ) : (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Cases" />
            </Bold>
          )}
          &nbsp;
          <Template code="PreviousContacts-From" />
          &nbsp;
          <Template code={localizedSource[task.channelType]} />
          &nbsp;
          <Bold>{contactIdentifier}</Bold>.
        </pre>
        <StyledLink underline data-testid="PreviousContacts-ViewRecords" onClick={handleClickViewRecords}>
          <Template code="PreviousContacts-ViewRecords" />
        </StyledLink>
      </YellowBanner>
    </div>
  );
};

PreviousContactsBanner.displayName = 'PreviousContactsBanner';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];
  const { counselors } = state[namespace][configurationBase];
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;

  return {
    previousContacts: taskSearchState.previousContacts,
    counselorsHash: counselors.hash,
    editContactFormOpen,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    viewPreviousContacts: viewPreviousContactsAction(dispatch)(task),
    searchContacts: searchContactsAction(dispatch)(taskId),
    searchCases: searchCasesAction(dispatch)(taskId),
    changeRoute: routing => dispatch(changeRouteAction(routing, taskId)),
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
export default connect(mapStateToProps, mapDispatchToProps)(PreviousContactsBanner);
