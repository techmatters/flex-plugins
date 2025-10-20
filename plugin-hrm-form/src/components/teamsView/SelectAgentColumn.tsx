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
import { createPortal } from 'react-dom';
import { WorkersDataTable, ColumnDefinition, useFlexSelector, Template, styled } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import type { SupervisorState } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState';
import { ArrowDropDown, ArrowDropUp, KeyboardArrowRight } from '@material-ui/icons';

import { getAseloFeatureFlags } from '../../hrmConfig';
import { namespace, teamsViewBase } from '../../states/storeNamespaces';
import {
  teamsViewSelectOperation,
  teamsViewSelectWorkers,
  TeamsViewState,
  teamsViewUnselectWorkers,
} from '../../states/teamsView/reducer';
import { newOpenModalAction } from '../../states/routing/actions';
import { StyledFormCheckbox } from '../forms/components/FormCheckbox/styles';
import { RootState } from '../../states';
import { Column, Flex, Row } from '../../styles';
import { MultiSelectButton } from '../../styles/filters';
import { UpdateWorkersSkillsModal } from './UpdateWorkersSkillsModal';
import { standaloneTask } from '../../types/types';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: sans-serif;
  transition: background 0.2s ease,

  &:hover {
    background: #f8f8f8;
  }
`;
const DropDownButton: React.FC<{ onClick: () => void }> = ({ onClick, children }) => {
  return (
    <StyledButton type="button" onClick={onClick}>
      {children}
    </StyledButton>
  );
};

const DropdownPortal: React.FC<{
  anchorRef: any;
  boxHeight: number;
  open: boolean;
  onClickAction: (operation: TeamsViewState['operation']) => () => void;
}> = ({ anchorRef, boxHeight, open, onClickAction }) => {
  const [coords, setCoords] = React.useState(null);

  // Update dropdown position when opened or resized
  React.useLayoutEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();

      setCoords({
        top: rect.bottom,
        left: rect.left,
      });
    }
  }, [anchorRef, boxHeight, open]);

  if (!open || !coords) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        marginTop: '5px',
        background: 'white',
        boxSizing: 'border-box',
        width: '230px',
        border: '1px solid lightgray',
        zIndex: 9999,
      }}
      role="dialog"
      aria-labelledby="dialog-title"
    >
      <Column>
        <DropDownButton onClick={onClickAction('enable')}>
          <Template code="Enable Skills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
        <DropDownButton onClick={onClickAction('disable')}>
          <Template code="Disable Skills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
      </Column>
    </div>,
    document.body,
  );
};

const SelectAllCheckbox: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const { selectedWorkers } = useSelector((state: RootState) => state[namespace][teamsViewBase]);
  const { workers } =
    useFlexSelector((state: RootState) => state.flex.supervisor) || ({ workers: [] } as SupervisorState);

  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef(null);

  const boxRef = React.useRef(null);
  const [boxHeight, setBoxHeight] = React.useState(0);

  React.useEffect(() => {
    if (boxRef.current) {
      setBoxHeight(boxRef.current.clientHeight);
    }
  }, []);

  const workersSids = workers.map(w => w.worker.sid);
  const allChecked = workersSids.length && workersSids.every(w => selectedWorkers?.has(w));

  const toggleAllWorkers = () =>
    allChecked ? dispatch(teamsViewUnselectWorkers(workersSids)) : dispatch(teamsViewSelectWorkers(workersSids));

  return (
    <>
      <Row ref={boxRef}>
        <StyledFormCheckbox
          type="checkbox"
          checked={allChecked}
          onChange={toggleAllWorkers}
          onClick={e => {
            e.stopPropagation();
          }}
        />
        <MultiSelectButton
          isOpened={isOpen}
          isActive={selectedWorkers.size > 0}
          disabled={selectedWorkers.size === 0}
          type="button"
          onClick={() => {
            setIsOpen(prev => !prev);
          }}
          ref={buttonRef}
        >
          <Template code="Actions" />
          <Flex marginLeft="15px">
            {isOpen && <ArrowDropUp />}
            {!isOpen && <ArrowDropDown />}
          </Flex>
        </MultiSelectButton>
        <DropdownPortal
          anchorRef={buttonRef}
          boxHeight={boxHeight}
          open={isOpen}
          onClickAction={operation => () => {
            dispatch(teamsViewSelectOperation(operation));
            // dispatch(changeRoute({ route: 'teams' }, standaloneTask.taskSid));
            dispatch(newOpenModalAction({ route: 'teams', subroute: 'select-skills' }, standaloneTask.taskSid));
            setIsOpen(false);
            // setOpenModal(true);
          }}
        />
      </Row>
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
    isSelected ? dispatch(teamsViewUnselectWorkers([worker.sid])) : dispatch(teamsViewSelectWorkers([worker.sid]));

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
      style={{ width: '150px', padding: '0px', position: 'relative' }}
      content={(item: any) => <SelectWorkerCheckbox item={item} />}
    />,
    { sortOrder: 0 },
  );
};
