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

import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import NavigableContainer from '../../NavigableContainer';
import { CaseLayout } from '../styles';
import { CustomITask, StandaloneITask } from '../../../types/types';
import AddToCaseBanner from '../../caseMergingBanners/AddToCaseBanner';
import Timeline from './Timeline';
import { RootState } from '../../../states';
import { selectCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import { CaseTimelineRoute, ChangeRouteMode } from '../../../states/routing/types';
import { selectCaseActivityCount } from '../../../states/case/timeline';
import Pagination from '../../pagination';
import { changeRoute } from '../../../states/routing/actions';

type MyProps = {
  task: CustomITask | StandaloneITask;
};

const TIMELINE_PAGE_SIZE = 25;

const mapStateToProps = (state: RootState, { task }: MyProps) => {
  const { caseId, page = 0 } = selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseTimelineRoute;
  return {
    page,
    activityCount: selectCaseActivityCount(state, caseId),
    caseId,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: MyProps) => {
  return {
    changePage: (caseId: string) => (page: number) =>
      dispatch(
        changeRoute({ route: 'case', subroute: 'timeline', caseId, page }, task.taskSid, ChangeRouteMode.Replace),
      ),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = MyProps & ConnectedProps<typeof connector>;

const FullTimelineView: React.FC<Props> = ({ task, page, activityCount, changePage, caseId }: Props) => {
  const changePageForThisCase = changePage(caseId);

  return (
    <CaseLayout>
      <NavigableContainer
        task={task}
        titleCode="Case-Timeline-ModalTitle"
        titleValues={{ caseId }}
        style={{ textAlign: 'center' }}
      >
        <AddToCaseBanner task={task} />
        <Timeline taskSid={task.taskSid} pageSize={TIMELINE_PAGE_SIZE} page={page} titleCode="Case-Timeline-Title" />
        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
          <Template
            code="Case-Timeline-PaginationDescription"
            from={page * TIMELINE_PAGE_SIZE + 1}
            to={Math.min((page + 1) * TIMELINE_PAGE_SIZE, activityCount)}
            total={activityCount}
          />
        </p>
        {activityCount > TIMELINE_PAGE_SIZE && (
          <Pagination
            pagesCount={Math.ceil(activityCount / TIMELINE_PAGE_SIZE)}
            page={page}
            handleChangePage={changePageForThisCase}
          />
        )}
      </NavigableContainer>
    </CaseLayout>
  );
};

FullTimelineView.displayName = 'FullTimelineView';

export default connector(FullTimelineView);
