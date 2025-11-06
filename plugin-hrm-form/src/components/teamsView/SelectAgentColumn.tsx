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
import { WorkersDataTable, ColumnDefinition, useFlexSelector } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import type { SupervisorState } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState';

import { getAseloFeatureFlags } from '../../hrmConfig';
import type { RootState } from '../../states';
import { namespace, teamsViewBase } from '../../states/storeNamespaces';
import { newTeamsViewSelectWorkers, newTeamsViewUnselectWorkers } from '../../states/teamsView';
import { StyledFormCheckbox } from '../forms/components/FormCheckbox/styles';
import { UpdateWorkersSkillsModal } from './UpdateWorkersSkillsModal';
import { standaloneTask } from '../../types/types';

const SelectAllCheckbox: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const { selectedWorkers } = useSelector((state: RootState) => state[namespace][teamsViewBase]);
  const { workers } =
    useFlexSelector((state: RootState) => state.flex.supervisor) || ({ workers: [] } as SupervisorState);

  const workersSids = workers.map(w => w.worker.sid);
  const allChecked = workersSids.length && workersSids.every(w => selectedWorkers?.has(w));

  const toggleAllWorkers = () =>
    allChecked ? dispatch(newTeamsViewUnselectWorkers(workersSids)) : dispatch(newTeamsViewSelectWorkers(workersSids));

  return (
    <>
      <StyledFormCheckbox
        type="checkbox"
        checked={allChecked}
        onChange={toggleAllWorkers}
        onClick={e => {
          e.stopPropagation();
        }}
      />
      <UpdateWorkersSkillsModal task={standaloneTask} />
    </>
  );
};

const SelectWorkerCheckbox: React.FC<{
  item: { worker: { sid: string; fullName: string } };
}> = ({ item }) => {
  const dispatch = useDispatch();
  const { selectedWorkers } = useSelector((state: RootState) => state[namespace][teamsViewBase]);
  const { worker } = item;
  const isSelected = selectedWorkers?.has(worker.sid);
  const toggleSingleWorker = () =>
    isSelected
      ? dispatch(newTeamsViewUnselectWorkers([worker.sid]))
      : dispatch(newTeamsViewSelectWorkers([worker.sid]));

  return (
    <StyledFormCheckbox
      type="checkbox"
      checked={isSelected}
      onChange={toggleSingleWorker}
      onClick={e => {
        e.stopPropagation();
      }}
    />
  );
};

export const setUpSelectAgentColumn = () => {
  const { enable_select_agents_teams_view: enableSelectAgentsTeamsView } = getAseloFeatureFlags();
  if (!enableSelectAgentsTeamsView) return;

  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="select-worker"
      header={<SelectAllCheckbox />}
      style={{ width: '40px', padding: '0px' }}
      content={(item: any) => <SelectWorkerCheckbox item={item} />}
    />,
    { sortOrder: 0 },
  );
};
