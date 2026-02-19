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
import { useDispatch, useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import Case from '../case';
import { StandaloneITask, Case as CaseType } from '../../types/types';
import CaseListTable from './CaseListTable';
import { ListContainer, CenteredContainer, SomethingWentWrongText, StandaloneContainer } from '../../styles';
import { CaseLayout } from '../case/styles';
import { RootState } from '../../states';
import * as ListContent from '../../states/caseList/listContent';
import { getHrmConfig } from '../../hrmConfig';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { newCloseModalAction, newOpenModalAction } from '../../states/routing/actions';
import { isContactRoute, ProfileRoute, AppRoutes, ContactRoute } from '../../states/routing/types';
import ContactDetails from '../contact/ContactDetails';
import { DetailsContext } from '../../states/contacts/contactDetails';
import selectCasesForList from '../../states/caseList/selectCasesForList';
import selectCaseListSettings from '../../states/caseList/selectCaseListSettings';
import asyncDispatch from '../../states/asyncDispatch';
import ProfileRouter, { isProfileRoute } from '../profile/ProfileRouter';

export const CASES_PER_PAGE = 10;

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

const CaseList: React.FC = () => {
  const dispatch = useDispatch();
  const currentSettings = useSelector((state: RootState) => selectCaseListSettings(state).current);
  const routing = useSelector(
    (state: RootState) =>
      selectCurrentTopmostRouteForTask(state, standaloneTask.taskSid) ?? {
        route: 'case-list',
        subroute: 'case-list',
      },
  );
  const { cases: caseList, count: caseCount, fetchError, listLoading } = useSelector((state: RootState) =>
    selectCasesForList(state),
  );
  const { helpline } = getHrmConfig();

  useEffect(() => {
    asyncDispatch(dispatch)(ListContent.fetchCaseListAsyncAction(currentSettings, helpline, CASES_PER_PAGE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings, helpline]);

  const handleClickViewCase = (currentCase: CaseType) => () => {
    dispatch(
      newOpenModalAction(
        { route: 'case', subroute: 'home', caseId: currentCase.id.toString() },
        standaloneTask.taskSid,
      ),
    );
  };

  const closeCaseView = async () => {
    dispatch(newCloseModalAction(standaloneTask.taskSid));
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
      <StandaloneContainer>
        <CaseLayout>
          <Case task={standaloneTask} handleClose={closeCaseView} />
        </CaseLayout>
      </StandaloneContainer>
    );
  }

  if (routing.route === 'contact' && isContactRoute(routing as AppRoutes)) {
    const contactRoute = routing as ContactRoute;
    return (
      <StandaloneContainer>
        <CaseLayout>
          <ContactDetails
            contactId={contactRoute.id}
            enableEditing={true}
            context={DetailsContext.CASE_DETAILS}
            task={standaloneTask}
          />
        </CaseLayout>
      </StandaloneContainer>
    );
  }

  if (isProfileRoute(routing as AppRoutes)) {
    return (
      <StandaloneContainer>
        <ProfileRouter task={standaloneTask} />
      </StandaloneContainer>
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

export default CaseList;
