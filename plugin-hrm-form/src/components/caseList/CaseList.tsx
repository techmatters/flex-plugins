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

import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import Case from '../case';
import {
  StandaloneITask,
  ListCasesQueryParams,
  ListCasesFilters,
  ListCasesSort,
  Case as CaseType,
} from '../../types/types';
import CaseListTable from './CaseListTable';
import { CaseListContainer, CenteredContainer, SomethingWentWrongText } from '../../styles/caseList';
import { listCases } from '../../services/CaseService';
import { CaseLayout } from '../../styles/case';
import * as ConfigActions from '../../states/configuration/actions';
import { StandaloneSearchContainer } from '../../styles/search';
import { getCasesMissingVersions } from '../../utils/definitionVersions';
import { RootState } from '../../states';
import { undoCaseListSettingsUpdate } from '../../states/caseList/reducer';
import { dateFilterPayloadFromFilters } from './filters/dateFilters';
import * as ListContent from '../../states/caseList/listContent';
import { getHrmConfig } from '../../hrmConfig';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { newCloseModalAction, newOpenModalAction } from '../../states/routing/actions';
import ContactDetails from '../contact/ContactDetails';
import { DetailsContext } from '../../states/contacts/contactDetails';

export const CASES_PER_PAGE = 10;

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

type OwnProps = {};

const mapDispatchToProps = dispatch => {
  return {
    updateDefinitionVersion: (version: string, definitions: DefinitionVersion) =>
      dispatch(ConfigActions.updateDefinitionVersion(version, definitions)),
    undoSettingsUpdate: () => dispatch(undoCaseListSettingsUpdate()),
    fetchCaseListStarted: () => dispatch(ListContent.fetchCaseListStarted()),
    fetchCaseListSuccess: (caseList: CaseType[], caseCount: number) =>
      dispatch(ListContent.fetchCaseListSuccess(caseList, caseCount)),
    fetchCaseListError: error => dispatch(ListContent.fetchCaseListError(error)),
    openCaseDetails: (caseId: string) =>
      dispatch(newOpenModalAction({ route: 'case', subroute: 'home', caseId }, standaloneTask.taskSid)),
    closeCaseDetails: () => dispatch(newCloseModalAction(standaloneTask.taskSid)),
  };
};

const mapStateToProps = ({ [namespace]: { caseList, routing } }: RootState) => ({
  currentSettings: caseList.currentSettings,
  previousSettings: caseList.previousSettings,
  routing: getCurrentTopmostRouteForTask(routing, standaloneTask.taskSid) ?? {
    route: 'case-list',
    subroute: 'case-list',
  },
  ...caseList.content,
});

const connector = connect(mapStateToProps, mapDispatchToProps);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseList: React.FC<Props> = ({
  updateDefinitionVersion,
  currentSettings,
  fetchCaseListStarted,
  fetchCaseListSuccess,
  fetchCaseListError,
  openCaseDetails,
  closeCaseDetails,
  caseList,
  caseCount,
  fetchError,
  listLoading,
  routing,
}) => {
  const { helpline } = getHrmConfig();

  const fetchCaseList = async (page: number, sort: ListCasesSort, filters: ListCasesFilters) => {
    try {
      fetchCaseListStarted();
      const queryParams: ListCasesQueryParams = {
        ...sort,
        offset: page * CASES_PER_PAGE,
        limit: CASES_PER_PAGE,
      };
      const listCasesPayload = {
        filters: {
          ...filters,
          ...dateFilterPayloadFromFilters({
            createdAt: filters?.createdAt,
            updatedAt: filters?.updatedAt,
            followUpDate: filters?.followUpDate,
          }),
        },
        helpline,
      };
      const { cases, count } = await listCases(queryParams, listCasesPayload);

      const definitions = await getCasesMissingVersions(cases);
      definitions.forEach(d => updateDefinitionVersion(d.version, d.definition));
      fetchCaseListSuccess(cases, count);
    } catch (error) {
      console.error(error);
      undoCaseListSettingsUpdate();
      fetchCaseListError(error);
    }
  };

  useEffect(() => {
    fetchCaseList(currentSettings.page, currentSettings.sort, currentSettings.filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings]);

  const handleClickViewCase = (currentCase: CaseType) => () => {
    openCaseDetails(currentCase.id.toString());
  };

  const closeCaseView = async () => {
    // Reload the current page of the list to reflect any updates to the case just being viewed
    await fetchCaseList(currentSettings.page, currentSettings.sort, currentSettings.filter);
    closeCaseDetails();
  };

  if (fetchError)
    return (
      <CenteredContainer>
        <SomethingWentWrongText data-testid="CaseList-SomethingWentWrongText">
          <Template code="CaseList-SomethingWentWrong" />
        </SomethingWentWrongText>
      </CenteredContainer>
    );

  if (routing.route === 'case') {
    return (
      <StandaloneSearchContainer>
        <CaseLayout>
          <Case task={standaloneTask} isCreating={false} handleClose={closeCaseView} />
        </CaseLayout>
      </StandaloneSearchContainer>
    );
  }

  if (routing.route === 'contact') {
    return (
      <StandaloneSearchContainer>
        <CaseLayout>
          <ContactDetails
            contactId={routing.id}
            enableEditing={true}
            context={DetailsContext.CASE_DETAILS}
            task={standaloneTask}
          />
        </CaseLayout>
      </StandaloneSearchContainer>
    );
  }
  return (
    <>
      <CaseListContainer>
        <CaseListTable
          loading={listLoading}
          caseList={caseList}
          caseCount={caseCount}
          handleClickViewCase={handleClickViewCase}
        />
      </CaseListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';
const connected = connector(CaseList);

export default connected;
