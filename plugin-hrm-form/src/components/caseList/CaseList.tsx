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
import { StandaloneITask, Case as CaseType } from '../../types/types';
import CaseListTable from './CaseListTable';
import { ListContainer, CenteredContainer, SomethingWentWrongText } from '../../styles/table';
import { listCases } from '../../services/CaseService';
import { CaseLayout } from '../../styles/case';
import * as ConfigActions from '../../states/configuration/actions';
import { StandaloneSearchContainer } from '../../styles/search';
import { RootState } from '../../states';
import * as ListContent from '../../states/caseList/listContent';
import { getHrmConfig } from '../../hrmConfig';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { newCloseModalAction, newOpenModalAction } from '../../states/routing/actions';
import ContactDetails from '../contact/ContactDetails';
import { DetailsContext } from '../../states/contacts/contactDetails';
import selectCasesForList from '../../states/caseList/selectCasesForList';
import selectCaseListSettings from '../../states/caseList/selectCaseListSettings';
import { CaseListSettingsState } from '../../states/caseList/settings';
import asyncDispatch from '../../states/asyncDispatch';

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
    fetchCaseList: (settings: CaseListSettingsState, helpline) =>
      asyncDispatch(dispatch)(ListContent.fetchCaseListAsyncAction(settings, helpline, CASES_PER_PAGE)),
    openCaseDetails: (caseId: string) =>
      dispatch(newOpenModalAction({ route: 'case', subroute: 'home', caseId }, standaloneTask.taskSid)),
    closeCaseDetails: () => dispatch(newCloseModalAction(standaloneTask.taskSid)),
  };
};

const mapStateToProps = (state: RootState) => {
  return {
    currentSettings: selectCaseListSettings(state).current,
    routing: selectCurrentTopmostRouteForTask(state, standaloneTask.taskSid) ?? {
      route: 'case-list',
      subroute: 'case-list',
    },
    ...selectCasesForList(state),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseList: React.FC<Props> = ({
  openCaseDetails,
  closeCaseDetails,
  cases: caseList,
  count: caseCount,
  currentSettings,
  fetchError,
  listLoading,
  routing,
  fetchCaseList,
}) => {
  const { helpline } = getHrmConfig();

  useEffect(() => {
    fetchCaseList(currentSettings, helpline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings, helpline]);

  const handleClickViewCase = (currentCase: CaseType) => () => {
    openCaseDetails(currentCase.id.toString());
  };

  const closeCaseView = async () => {
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
          <Case task={standaloneTask} handleClose={closeCaseView} />
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
      <ListContainer>
        <CaseListTable
          loading={listLoading}
          caseList={caseList}
          caseCount={caseCount}
          handleClickViewCase={handleClickViewCase}
        />
      </ListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';
const connected = connector(CaseList);

export default connected;
