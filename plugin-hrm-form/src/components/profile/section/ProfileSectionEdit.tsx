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
import { connect, ConnectedProps } from 'react-redux';
import startCase from 'lodash/startCase';

import NavigableContainer from '../../NavigableContainer';
import { ProfileSection } from '../../../types/types';
import {
  Flex,
  StyledNextStepButton,
  Container,
  Box,
  ColumnarBlock,
  ColumnarContent,
  FormTextArea,
} from '../../../styles/HrmStyles';
import { useEditProfileSection, useSectionTypes } from '../../../states/profile/hooks/useProfileSection';
import { ProfileCommonProps } from '../types';
import * as RoutingActions from '../../../states/routing/actions';

type OwnProps = ProfileCommonProps & {
  sectionType: ProfileSection['sectionType'];
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileSectionEdit = ({ task, profileId, sectionType, closeModal }: Props) => {
  const { section, createProfileSection, updateProfileSection } = useEditProfileSection({ profileId, sectionType });
  const sectionTypesForms = useSectionTypes();
  const sectionTypesForm: any = sectionTypesForms.find(sectionTypesForm => sectionTypesForm.name === sectionType);
  console.log('>>> ProfileSectionEdit form definition', { sectionTypesForms, sectionTypesForm });

  const [content, setContent] = useState<string>(section?.content || '');
  const sectionId: ProfileSection['id'] = section?.id;

  const handleEdit = () => {
    if (!sectionId) {
      createProfileSection({ profileId, sectionType, content });
      closeModal();
      return;
    }
    updateProfileSection({ profileId, sectionType, content, sectionId });
    closeModal();
  };

  return (
    <NavigableContainer titleCode={`Edit ${startCase(sectionType)}`} task={task}>
      <Container>
        <Box>
          <ColumnarBlock>
            <ColumnarContent>
              <FormTextArea
                defaultValue={content}
                onChange={e => setContent(e.target.value)}
                rows={sectionTypesForm.rows}
                width={sectionTypesForm.width}
                placeholder={sectionTypesForm.placeholder}
              />
            </ColumnarContent>
          </ColumnarBlock>
        </Box>
      </Container>
      <Flex justifyContent="flex-end" flexDirection="row">
        <StyledNextStepButton roundCorners onClick={handleEdit}>
          Save
        </StyledNextStepButton>
      </Flex>
    </NavigableContainer>
  );
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => {
  return {
    closeModal: () => dispatch(RoutingActions.newCloseModalAction(task.taskSid)),
  };
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(ProfileSectionEdit);

export default connected;
