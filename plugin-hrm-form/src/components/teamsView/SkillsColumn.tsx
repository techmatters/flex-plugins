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
import { WorkersDataTable, ColumnDefinition, Template } from '@twilio/flex-ui';
import { Tooltip } from '@material-ui/core';

import { OpaqueText } from '../../styles';
import { SkillsList, StyledChip } from './styles';
import { sortSkills } from './teamsViewSorting';

const MAX_SKILL_LENGTH = 12;

export const setUpSkillsColumn = () => {
  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="skills"
      header="Skills"
      sortingFn={sortSkills}
      style={{ width: 'auto !important' }}
      content={item => {
        const availableSkills = item?.worker?.attributes?.routing?.skills ?? [];
        const disabledSkills = item?.worker?.attributes?.disabled_skills?.skills ?? [];
        const workerName = item?.worker?.attributes?.full_name ?? '';
        return <SkillsCell availableSkills={availableSkills} disabledSkills={disabledSkills} workerName={workerName} />;
      }}
    />,
    { sortOrder: 0 },
  );
};

const SkillsCell = ({ availableSkills, disabledSkills, workerName }) => {
  const combinedSkills = [
    ...availableSkills.map(skill => ({ skill, type: 'active' })),
    ...disabledSkills.map(skill => ({ skill, type: 'disabled' })),
  ];

  if (combinedSkills.length === 0) {
    return (
      <OpaqueText style={{ fontSize: '12px' }}>
        <Template code="TeamsView-NoSkills" aria-label={`No skills available for ${workerName}`} />
      </OpaqueText>
    );
  }

  return (
    <SkillsList>
      {combinedSkills.map(({ skill, type }) =>
        skill.length > MAX_SKILL_LENGTH ? (
          <Tooltip key={skill} title={skill}>
            <StyledChip chipType={type}>{`${skill.substring(0, MAX_SKILL_LENGTH)}…`}</StyledChip>
          </Tooltip>
        ) : (
          <StyledChip key={skill} chipType={type}>
            {skill}
          </StyledChip>
        ),
      )}
    </SkillsList>
  );
};
