import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { getConfig } from '../../HrmFormPlugin';
import Case from '../case';
import { StandaloneITask, ListCasesQueryParams, ListCasesFilters, ListCasesSort } from '../../types/types';
import CaseListTable from './CaseListTable';
import { CaseListContainer, CenteredContainer, SomethingWentWrongText } from '../../styles/caseList';
import { CaseLayout } from '../../styles/case';
import * as CaseActions from '../../states/case/actions';
import { StandaloneSearchContainer } from '../../styles/search';
import { caseListBase, namespace, RootState } from '../../states';
import { undoCaseListSettingsUpdate } from '../../states/caseList/reducer';
import { dateFilterPayloadFromFilters } from './filters/dateFilters';
import * as ListContent from '../../states/caseList/listContent';
import { useLoadDefinitionVersions } from '../../hooks/useLoadDefinitionVersions';

export const CASES_PER_PAGE = 10;

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseList: React.FC<Props> = ({
  setConnectedCase,
  currentSettings,
  fetchCaseList,
  openCaseDetails,
  closeCaseDetails,
  caseList,
  caseCount,
  caseDetailsOpen,
  fetchError,
  listLoading,
}) => {
  const { helpline } = getConfig();

  const { isLoadingDefinitionVersions } = useLoadDefinitionVersions(caseList, c => c.info.definitionVersion);

  const dispatchFetchCaseList = async (page: number, sort: ListCasesSort, filters: ListCasesFilters) => {
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
    fetchCaseList(queryParams, listCasesPayload);
  };

  useEffect(() => {
    dispatchFetchCaseList(currentSettings.page, currentSettings.sort, currentSettings.filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSettings]);

  useEffect(() => {
    if (fetchError) {
      console.error(fetchError);
      undoCaseListSettingsUpdate();
    }
  }, [fetchError]);

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, standaloneTask.taskSid);
    openCaseDetails();
  };

  const closeCaseView = async () => {
    // Reload the current page of the list to reflect any updates to the case just being viewed
    await dispatchFetchCaseList(currentSettings.page, currentSettings.sort, currentSettings.filter);
    closeCaseDetails();
  };

  const isLoading = listLoading || isLoadingDefinitionVersions;

  if (fetchError)
    return (
      <CenteredContainer>
        <SomethingWentWrongText data-testid="CaseList-SomethingWentWrongText">
          <Template code="CaseList-SomethingWentWrong" />
        </SomethingWentWrongText>
      </CenteredContainer>
    );

  if (caseDetailsOpen) {
    return (
      <StandaloneSearchContainer>
        <CaseLayout>
          <Case task={standaloneTask} isCreating={false} handleClose={closeCaseView} />
        </CaseLayout>
      </StandaloneSearchContainer>
    );
  }

  return (
    <>
      <CaseListContainer>
        <CaseListTable
          loading={isLoading}
          caseList={caseList}
          caseCount={caseCount}
          handleClickViewCase={handleClickViewCase}
        />
      </CaseListContainer>
    </>
  );
};

CaseList.displayName = 'CaseList';

CaseList.propTypes = {
  setConnectedCase: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setConnectedCase: CaseActions.setConnectedCase,
  undoSettingsUpdate: undoCaseListSettingsUpdate,
  fetchCaseList: ListContent.fetchCaseList,
  openCaseDetails: ListContent.openCaseDetails,
  closeCaseDetails: ListContent.closeCaseDetails,
};

const mapStateToProps = (state: RootState) => ({
  currentSettings: state[namespace][caseListBase].currentSettings,
  previousSettings: state[namespace][caseListBase].previousSettings,
  ...state[namespace][caseListBase].content,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseList);

export default connected;
