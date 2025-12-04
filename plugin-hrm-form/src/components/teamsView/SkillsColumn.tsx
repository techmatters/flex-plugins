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
import { useDispatch, useSelector } from 'react-redux';
import { WorkersDataTable, ColumnDefinition, Template, styled } from '@twilio/flex-ui';
import { Divider, Tooltip } from '@material-ui/core';
import { ArrowDropDown, ArrowDropUp, KeyboardArrowRight } from '@material-ui/icons';

import { Flex, Column, OpaqueText, Row, Box } from '../../styles';
import { MultiSelectButton } from '../../styles/filters';
import { SkillsList, StyledChip } from './styles';
import { sortSkills } from './teamsViewSorting';
import { newTeamsViewSelectOperation, TeamsViewState } from '../../states/teamsView';
import { newOpenModalAction } from '../../states/routing/actions';
import type { RootState } from '../../states';
import { namespace, teamsViewBase } from '../../states/storeNamespaces';
import { standaloneTask } from '../../types/types';

const MAX_SKILL_LENGTH = 12;

const SkillsColumnHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedWorkers } = useSelector((state: RootState) => state[namespace][teamsViewBase]);

  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef(null);

  const boxRef = React.useRef(null);

  return (
    <>
      <Row ref={boxRef}>
        <Template code="TeamsView-SkillsColumnTitle" />
        {Boolean(selectedWorkers.size) && (
          <Box marginLeft="10px">
            <MultiSelectButton
              isOpened={isOpen}
              isActive={Boolean(selectedWorkers.size)}
              disabled={!selectedWorkers.size}
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsOpen(prev => !prev);
              }}
              ref={buttonRef}
              style={{ textDecorationLine: 'none' }}
            >
              <Template code="TeamsView-SkillsActionsButtonTitle" />
              <Flex marginLeft="15px">
                {isOpen && <ArrowDropUp />}
                {!isOpen && <ArrowDropDown />}
              </Flex>
            </MultiSelectButton>
          </Box>
        )}
      </Row>
      <DropdownPortal
        anchorRef={buttonRef}
        open={isOpen}
        onClickAction={operation => e => {
          e.stopPropagation();
          dispatch(newTeamsViewSelectOperation(operation));
          dispatch(newOpenModalAction({ route: 'teams', subroute: 'select-skills' }, standaloneTask.taskSid));
          setIsOpen(false);
        }}
      />
    </>
  );
};

export const setUpSkillsColumn = () => {
  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="skills"
      header={<SkillsColumnHeader />}
      sortingFn={sortSkills}
      style={{ width: 'auto !important' }}
      content={item => <SkillsCell item={item} />}
    />,
    { sortOrder: 0 },
  );
};

const SkillsCell = ({ item }) => {
  const availableSkills = item?.worker?.attributes?.routing?.skills ?? [];
  const disabledSkills = item?.worker?.attributes?.disabled_skills?.skills ?? [];
  const workerName = item?.worker?.attributes?.full_name ?? '';

  const combinedSkills = [
    ...availableSkills.map(skill => ({ skill, type: 'active' })),
    ...disabledSkills.map(skill => ({ skill, type: 'disabled' })),
  ];

  return combinedSkills.length === 0 ? (
    <OpaqueText>
      <Template code="TeamsView-NoSkills" aria-label={`No skills available for ${workerName}`} />
    </OpaqueText>
  ) : (
    <SkillsList>
      {combinedSkills.map(({ skill, type }) =>
        skill.length > MAX_SKILL_LENGTH ? (
          <Tooltip key={skill} title={skill}>
            <StyledChip chipType={type} aria-label={skill}>
              {skill.slice(0, MAX_SKILL_LENGTH)}...
            </StyledChip>
          </Tooltip>
        ) : (
          <StyledChip key={skill} chipType={type} aria-label={skill}>
            {skill}
          </StyledChip>
        ),
      )}
    </SkillsList>
  );
};

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
const DropDownButton: React.FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> }> = ({ onClick, children }) => {
  return (
    <StyledButton type="button" onClick={onClick}>
      {children}
    </StyledButton>
  );
};
const DropdownPortal: React.FC<{
  anchorRef: any;
  open: boolean;
  onClickAction: (operation: TeamsViewState['operation']) => React.MouseEventHandler<HTMLButtonElement>;
}> = ({ anchorRef, open, onClickAction }) => {
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
  }, [anchorRef, open]);

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
          <Template code="TeamsView-EnableSkills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
        <DropDownButton onClick={onClickAction('disable')}>
          <Template code="TeamsView-DisableSkills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
        <Divider variant="middle" />
        <DropDownButton onClick={onClickAction('assign')}>
          <Template code="TeamsView-AssignSkills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
        <DropDownButton onClick={onClickAction('unassign')}>
          <Template code="TeamsView-UnassignSkills" />
          <KeyboardArrowRight style={{ marginLeft: '20px' }} />
        </DropDownButton>
      </Column>
    </div>,
    document.body,
  );
};
