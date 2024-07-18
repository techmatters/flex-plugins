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
import React from 'react';
import { useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../../states';
import { Bold, FontOpenSans } from '../../../styles';
import { getAseloFeatureFlags } from '../../../hrmConfig';

type SearchResultsQueryTemplateProps = {
  task: any;
  searchContext: any;
  subroute: string;
  casesCount: any;
  contactsCount: any;
  counselorsHash: { [sid: string]: string };
};

export const SearchResultsQueryTemplate: React.FC<SearchResultsQueryTemplateProps> = ({
  task,
  searchContext,
  subroute,
  casesCount,
  contactsCount,
  counselorsHash,
}) => {
  const enableGeneralizedSearch = getAseloFeatureFlags().enable_generalized_search;

  const { activeView, searchFormQuery, agentFormQuery } = useSelector((state: RootState) => {
    const { taskSid } = task;
    const pluginHrmForm = state['plugin-hrm-form'].searchContacts.tasks[taskSid];
    return {
      activeView: state.flex.view.activeView,
      searchFormQuery: pluginHrmForm?.root?.form,
      agentFormQuery: pluginHrmForm?.[searchContext]?.form,
    };
  });

  const transformDate = date => new Date(date).toLocaleDateString();

  const countString = (subroute, casesCount: number, contactsCount: number) => {
    if (subroute === 'case-results') {
      return casesCount === 1 ? (
        <Template code="SearchResults-Case" />
      ) : (
        <>
          {casesCount}
          <Template code="SearchResults-Cases" />
        </>
      );
    }
    return contactsCount === 1 ? (
      <Template code="SearchResults-Contact" />
    ) : (
      <>
        {contactsCount}
        <Template code="SearchResults-Contacts" />
      </>
    );
  };

  const counselorNameString = (counselor, counselorsHash) => {
    if (enableGeneralizedSearch && counselor !== '') {
      console.log('>>> counselor', { enableGeneralizedSearch, counselor });
      return (
        <>
          {' '}
          <Template code="SearchResults-CounselorName" /> <Bold>{counselorsHash[counselor]}.</Bold>
        </>
      );
    }

    if (!enableGeneralizedSearch && counselor?.label !== '') {
      return (
        <>
          {' '}
          <Template code="SearchResults-CounselorName" /> <Bold>{counselor?.label}.</Bold>
        </>
      );
    }
    return null;
  };

  let currentContext;
  if (activeView === 'search') {
    currentContext = searchFormQuery;
  } else if (activeView === 'agent-desktop') {
    currentContext = agentFormQuery;
  }
  const { dateFrom, dateTo, counselor, firstName, lastName, phoneNumber, searchTerm } = currentContext;

  return (
    <p>
      <FontOpenSans>
        {countString(subroute, casesCount, contactsCount)}
        {firstName && (
          <>
            {' '}
            <Template code="SearchResults-FirstName" /> <Bold>{firstName}. </Bold>
          </>
        )}
        {lastName && (
          <>
            {' '}
            <Template code="SearchResults-LastName" /> <Bold>{lastName}. </Bold>
          </>
        )}
        {phoneNumber && (
          <>
            {' '}
            <Template code="SearchResults-PhoneNumber" /> <Bold>{phoneNumber}. </Bold>
          </>
        )}

        {enableGeneralizedSearch ? (
          <>
            {' '}
            <Template code="SearchResults-For" /> <Bold>&quot;{searchTerm}&quot;. </Bold>
          </>
        ) : (
          <>. </>
        )}
        {counselorNameString(counselor, counselorsHash)}
        {dateFrom && (
          <>
            {' '}
            <Template code="SearchResults-DateFrom" />{' '}
            <Bold>{enableGeneralizedSearch ? dateFrom : transformDate(dateFrom)}. </Bold>{' '}
          </>
        )}
        {dateTo && (
          <>
            {' '}
            <Template code="SearchResults-DateTo" />{' '}
            <Bold>{enableGeneralizedSearch ? dateTo : transformDate(dateTo)}. </Bold>
          </>
        )}
      </FontOpenSans>
    </p>
  );
};
