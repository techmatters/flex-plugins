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

  const transformDate = date => new Date(date).toLocaleDateString();

  const ContextItem = ({ label, value }) => {
    if (!value) return null;
    const formattedValue =
      !enableGeneralizedSearch && (label === 'DateFrom' || label === 'DateTo') ? transformDate(value) : value;
    return (
      <>
        <Template code={`SearchResults-${label}`} /> <Bold>{formattedValue}.&nbsp;</Bold>
      </>
    );
  };

  return (
    <FontOpenSans>
      <span data-testid="SearchResultsCount">{countString(subroute, casesCount, contactsCount)}</span>

      {/* The following are for legacy search fields */}
      {!enableGeneralizedSearch && <>.&nbsp;</>}
      <ContextItem label="FirstName" value={currentContext?.firstName} />
      <ContextItem label="LastName" value={currentContext?.lastName} />
      <ContextItem label="PhoneNumber" value={currentContext?.phoneNumber} />
      <ContextItem label="Email" value={currentContext?.email} />

      {/* The following are for generalized search fields */}
      {enableGeneralizedSearch && (
        <>
          <Template code="SearchResults-For" />
          &nbsp;
        </>
      )}
      {currentContext?.searchTerm && <Bold>&quot;{currentContext?.searchTerm}&quot;.&nbsp;</Bold>}
      {counselorNameString(currentContext?.counselor, counselorsHash)}
      <ContextItem label="DateFrom" value={currentContext?.dateFrom} />
      <ContextItem label="DateTo" value={currentContext?.dateTo} />
    </FontOpenSans>
  );
};
