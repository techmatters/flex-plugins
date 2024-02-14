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
 */ /**
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
import { Template } from '@twilio/flex-ui';

import { ProfileSectionSubtitle, ProfileSectionWrapper } from './styles';
import { Box, Row } from '../../styles';

type OwnProps = {
  titleCode: string;
  editButton?: React.ReactNode;
};

const ProfileDetailsSection: React.FC<OwnProps> = ({ titleCode, editButton, children }) => {
  return (
    <div key={titleCode}>
      <ProfileSectionWrapper>
        <Box marginBottom="5px">
          <Row>
            <ProfileSectionSubtitle>{<Template code={titleCode} />}</ProfileSectionSubtitle>
            {editButton || null}
          </Row>
        </Box>
        <Box>{children}</Box>
      </ProfileSectionWrapper>
    </div>
  );
};

export default ProfileDetailsSection;
