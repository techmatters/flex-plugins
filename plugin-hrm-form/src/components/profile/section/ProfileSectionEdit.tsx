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

import { ProfileSection } from '../../../types/types';
import NavigableContainer from '../../NavigableContainer';
import { Flex, Container, Box, ColumnarBlock, ColumnarContent, FormTextArea } from '../../../styles/HrmStyles';
import { StyledNextStepButton } from '../../../styles/buttons';
import { useEditProfileSection } from '../../../states/profile/hooks/useProfileSection';
import useProfileSectionTypes from '../../../states/configuration/hooks/useProfileSectionTypes';
import { ProfileCommonProps } from '../types';
import * as RoutingActions from '../../../states/routing/actions';

type OwnProps = ProfileCommonProps & {
  sectionType: ProfileSection['sectionType'];
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => {
  return {
    closeModal: () => dispatch(RoutingActions.newCloseModalAction(task.taskSid)),
  };
};

const connector = connect(null, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileSectionEdit = ({ task, profileId, sectionType, closeModal }: Props) => {
  const { section, createProfileSection, updateProfileSection } = useEditProfileSection({ profileId, sectionType });
  const sectionTypesForms = useProfileSectionTypes();
  const sectionTypesForm = sectionTypesForms.find(sectionTypesForm => sectionTypesForm.name === sectionType);

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
    <NavigableContainer titleCode={sectionTypesForm.editLabel} task={task}>
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

export default connector(ProfileSectionEdit);
