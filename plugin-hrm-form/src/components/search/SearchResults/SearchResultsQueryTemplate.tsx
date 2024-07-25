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
import { CustomITask } from '../../../types/types';

type SearchResultsQueryTemplateProps = {
  task: CustomITask;
  searchContext: any;
  subroute: string;
  casesCount: number;
  contactsCount: number;
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
      activeView: state.flex?.view?.activeView,
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
      return (
        <>
          <Template code="SearchResults-CounselorName" /> <Bold>{counselorsHash[counselor]}.&nbsp;</Bold>
        </>
      );
    }

    if (!enableGeneralizedSearch && counselor?.label !== '') {
      return (
        <>
          <Template code="SearchResults-CounselorName" /> <Bold>{counselor?.label}.&nbsp;</Bold>
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

  return (
    <FontOpenSans>
      <span data-testid="SearchResultsCount">{countString(subroute, casesCount, contactsCount)}</span>
      {currentContext?.firstName && (
        <>
          <Template code="SearchResults-FirstName" /> <Bold>{currentContext?.firstName}.&nbsp;</Bold>
        </>
      )}
      {currentContext?.lastName && (
        <>
          <Template code="SearchResults-LastName" /> <Bold>{currentContext?.lastName}.&nbsp;</Bold>
        </>
      )}
      {currentContext?.phoneNumber && (
        <>
          <Template code="SearchResults-PhoneNumber" /> <Bold>{currentContext?.phoneNumber}.&nbsp;</Bold>
        </>
      )}
      {currentContext?.email && (
        <>
          <Template code="SearchResults-" /> <Bold>{currentContext?.email}.&nbsp;</Bold>
        </>
      )}
      {enableGeneralizedSearch ? (
        <>
          <Template code="SearchResults-For" />
          &nbsp;
        </>
      ) : (
        <>.&nbsp;</>
      )}
      {currentContext?.searchTerm && <Bold>&quot;{currentContext?.searchTerm}&quot;.&nbsp;</Bold>}
      {counselorNameString(currentContext?.counselor, counselorsHash)}
      {currentContext?.dateFrom && (
        <>
          <Template code="SearchResults-DateFrom" />
          &nbsp;
          <Bold>
            {enableGeneralizedSearch && currentContext?.dateFrom
              ? currentContext?.dateFrom
              : transformDate(currentContext?.dateFrom)}
            .&nbsp;
          </Bold>
        </>
      )}
      {currentContext?.dateTo && (
        <>
          <Template code="SearchResults-DateTo" />
          &nbsp;
          <Bold>
            {enableGeneralizedSearch && currentContext?.dateTo
              ? currentContext?.dateTo
              : transformDate(currentContext?.dateTo)}
            .&nbsp;
          </Bold>
        </>
      )}
    </FontOpenSans>
  );
};
