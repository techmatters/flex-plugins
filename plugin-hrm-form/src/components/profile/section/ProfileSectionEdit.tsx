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
import { useDispatch, useSelector } from 'react-redux';

import { namespace } from '../../../states/storeNamespaces';
import { RootState } from '../../../states';
import * as RoutingActions from '../../../states/routing/actions';
import { getCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import type { ProfileSectionEditRoute } from '../../../states/routing/types';
import { ProfileSection } from '../../../types/types';
import NavigableContainer from '../../NavigableContainer';
import { Flex, Container, Box, ColumnarBlock, ColumnarContent, FormTextArea } from '../../../styles';
import { PrimaryButton } from '../../../styles/buttons';
import { useEditProfileSection } from '../../../states/profile/hooks';
import useProfileSectionTypes from '../../../states/configuration/hooks/useProfileSectionTypes';
import { ProfileCommonProps } from '../types';

type Props = ProfileCommonProps;

const ProfileSectionEdit = ({ task, profileId }: Props) => {
  const dispatch = useDispatch();

  const sectionType = useSelector((state: RootState) => {
    const routingState = state[namespace].routing;
    const currentRouteStack = getCurrentTopmostRouteForTask(routingState, task.taskSid);
    return (currentRouteStack as ProfileSectionEditRoute)?.type;
  });
  const { section, createProfileSection, updateProfileSection } = useEditProfileSection({ profileId, sectionType });
  const sectionTypesForms = useProfileSectionTypes();
  const sectionTypesForm = sectionTypesForms.find(sectionTypesForm => sectionTypesForm.name === sectionType);

  const [content, setContent] = useState<string>(section?.content || '');
  const sectionId: ProfileSection['id'] = section?.id;

  const handleEdit = () => {
    if (!sectionId) {
      createProfileSection({ profileId, sectionType, content });
      dispatch(RoutingActions.newCloseModalAction(task.taskSid));
      return;
    }
    updateProfileSection({ profileId, sectionType, content, sectionId });
    dispatch(RoutingActions.newCloseModalAction(task.taskSid));
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
        <PrimaryButton roundCorners onClick={handleEdit}>
          Save
        </PrimaryButton>
      </Flex>
    </NavigableContainer>
  );
};

export default ProfileSectionEdit;
