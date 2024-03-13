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

import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { StyledLink } from '../../styles';

const sortFn = (first, second) => {
  return 0;
};

// eslint-disable-next-line import/no-unused-modules
export const setUpSkillsColumn = () => {
  WorkersDataTable.Content.add(
    <ColumnDefinition
      key="skills"
      header="Skills"
      sortingFn={sortFn}
      style={{ width: 'calc(18rem)' }}
      content={item => {
        console.log('>>> Skills item', item);
        const availableSkills = item?.worker?.attributes?.routing?.skills ?? [];
        const disabledSkills = item?.worker?.attributes?.disabled_skills?.skills ?? [];

        return <SkillsListCell availableSkills={availableSkills} disabledSkills={disabledSkills} />;
      }}
    />,
    { sortOrder: 0 },
  );
};

const SkillsListCell = ({ availableSkills, disabledSkills }) => {
  const [showMore, setShowMore] = useState(false);
  const combinedSkills = [
    ...availableSkills.map(skill => ({ skill, type: 'active' })),
    ...disabledSkills.map(skill => ({ skill, type: 'disabled' })),
  ];

  const displayedSkills = showMore ? combinedSkills : combinedSkills.slice(0, 3);

  return (
    <>
      {displayedSkills.map(({ skill, type }) => (
        <CategoryWithTooltip
          key={skill}
          category={skill}
          color={type === 'active' ? '#17bd38' : '#a3a0a0'}
          skillType={type}
        />
      ))}
      {combinedSkills.length > 3 && (
        <StyledLink
          onClick={e => {
            e.stopPropagation();
            setShowMore(!showMore);
          }}
        >
          {showMore ? <Template code="ReadLess" /> : <Template code="ReadMore" />}
        </StyledLink>
      )}
    </>
  );
};
