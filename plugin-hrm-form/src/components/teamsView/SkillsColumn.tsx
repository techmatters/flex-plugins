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

import React, { useState } from 'react';
import { WorkersDataTable, ColumnDefinition, Template } from '@twilio/flex-ui';

import SkillPill from './SkillPill';
import { StyledLink } from '../search/styles';
import { OpaqueText } from '../../styles';

const sortFn = (first, second) => {
  return 0;
};

export const setUpSkillsColumn = () => {
  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="skills"
      header="Skills"
      sortingFn={sortFn}
      style={{ width: 'calc(16rem)' }}
      content={item => {
        const availableSkills = item?.worker?.attributes?.routing?.skills ?? [];
        const disabledSkills = item?.worker?.attributes?.disabled_skills?.skills ?? [];
        const workerName = item?.worker?.attributes?.full_name ?? '';
        return (
          <SkillsListCell availableSkills={availableSkills} disabledSkills={disabledSkills} workerName={workerName} />
        );
      }}
    />,
    { sortOrder: 0 },
  );
};

const SkillsListCell = ({ availableSkills, disabledSkills, workerName }) => {
  const [showMore, setShowMore] = useState(false);

  const combinedSkills = [
    ...availableSkills.map(skill => ({ skill, type: 'active' })),
    ...disabledSkills.map(skill => ({ skill, type: 'disabled' })),
  ];

  const displayedSkills = showMore ? combinedSkills : combinedSkills.slice(0, 3);

  if (combinedSkills.length === 0) {
    return (
      <OpaqueText>
        <Template code="TeamsView-NoSkills" aria-label={`No skills available for ${workerName}`} />
      </OpaqueText>
    );
  }

  return (
    <>
      {displayedSkills.map(({ skill, type }) => (
        <SkillPill key={skill} skill={skill} skillType={type} />
      ))}
      {combinedSkills.length > 3 && (
        <StyledLink
          style={{ margin: '0px 0px 10px 4px', padding: '3px' }}
          onClick={e => {
            e.stopPropagation();
            setShowMore(!showMore);
          }}
          aria-label={showMore ? `See less skills for ${workerName}` : `See more skills for ${workerName}`}
        >
          <Template code={showMore ? 'ReadLess' : 'ReadMore'} />
        </StyledLink>
      )}
    </>
  );
};
