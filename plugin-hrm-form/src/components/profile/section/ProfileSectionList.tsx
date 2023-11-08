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

import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { IconButton, Template } from '@twilio/flex-ui';

import { CustomITask, Profile } from '../../../types/types';
import { Bold, Box, Column, Flex } from '../../../styles/HrmStyles';
import { useProfileSections } from '../../../states/profile/hooks/useProfileSection';
import { DetailsWrapper, EditButton, ProfileSubtitle } from '../styles';

type OwnProps = {
  profileId: Profile['id'];
  task: CustomITask;
  openNoteEditModal: (id: number) => void;
};

type Section = {
  titleCode?: string;
  title?: string;
  margin: string;
  renderComponent: () => React.ReactNode;
  handleEdit?: () => void;
};

const ProfileSectionList: React.FC<OwnProps> = ({ profileId, openNoteEditModal }) => {
  const profileSections = useProfileSections(profileId);
  const [showProfileSectionList, setShowProfileSectionList] = useState(false);

  console.log('>>> ProfileSectionList profileSections', profileSections, showProfileSectionList);

  useEffect(() => {
    if (profileSections.length > 0) {
      setShowProfileSectionList(true);
    }
  }, [profileSections, showProfileSectionList]);

  // Temp note content for demo purposes. Set to false to hide notes.
  const noteContent = <>Lorem ipsum dolor sit amet</>;

  const noteSections: Section[] = noteContent
    ? [
        {
          title: 'Summary',
          margin: '20px 0',
          renderComponent: () => noteContent,
          handleEdit: () => openNoteEditModal(1),
        },
        {
          title: 'Some other note',
          margin: '20px 0',
          renderComponent: () => noteContent,
          handleEdit: () => openNoteEditModal(1),
        },
        {
          title: 'One more note',
          margin: '20px 0',
          renderComponent: () => noteContent,
          handleEdit: () => openNoteEditModal(1),
        },
      ]
    : [];

  const renderEditButton = section => {
    return section.handleEdit ? (
      <Box alignSelf="center">
        <IconButton icon="Edit" title="Edit" size="small" onClick={section.handleEdit} />
      </Box>
    ) : null;
  };

  const renderTitle = section => {
    if (section.titleCode) {
      return <Template code={section.titleCode} />;
    }

    return section.title;
  };

  const renderSection = (section: any) => {
    return (
      <Box margin="20px 0">
        <Flex flexDirection="row">
          <Box alignSelf="center">
            <ProfileSubtitle>{renderTitle(section)}</ProfileSubtitle>
          </Box>
          {renderEditButton(section)}
        </Flex>
        <Box margin={section.margin}>{section.renderComponent()}</Box>
      </Box>
    );
  };

  return (
    <>
      {showProfileSectionList && profileSections.map(section => {
  console.log(section);
  return <div key={section?.id}>{section.name}</div>
})}
      {noteSections.map(section => (
        <div key={section.title}>{renderSection(section)}</div>
      ))}
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default ProfileSectionList;
