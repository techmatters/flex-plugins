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
import { connect, ConnectedProps } from 'react-redux';
import { IconButton, Template } from '@twilio/flex-ui';

import { getProfileSections } from '../../services/ProfileService';
import ProfileFlagList from './profileFlag/ProfileFlagList';
import { CustomITask, Profile } from '../../types/types';
import { DetailsWrapper, EditButton, ProfileSubtitle } from './styles';
import { Bold, Box, Column, Flex } from '../../styles/HrmStyles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfile } from '../../states/profile/hooks';

type OwnProps = {
  profileId: Profile['id'];
  task: CustomITask;
};

type Section = {
  titleCode?: string;
  title?: string;
  margin: string;
  renderComponent: () => React.ReactNode;
  handleEdit?: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileDetails: React.FC<Props> = ({ profileId, task, openFlagEditModal, openNoteEditModal }) => {
  const { profile } = useProfile({ profileId });

  // Temp note content for demo purposes. Set to false to hide notes.
  const noteContent = (
    <>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </>
  );

  const baseSections: Section[] = [
    {
      titleCode: 'Profile-IdentifiersHeader',
      margin: '20px 0',
      renderComponent: () =>
        profile.identifiers ? (
          profile.identifiers.map(identifier => <div key={identifier.id}>{identifier.identifier}</div>)
        ) : (
          <Template code="Profile-NoIdentifiersFound" />
        ),
    },
    {
      titleCode: 'Profile-StatusHeader',
      margin: '10px 4px',
      renderComponent: () => <ProfileFlagList profileId={profileId} task={task} />,
      handleEdit: () => openFlagEditModal(),
    },
  ];

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

  const sections: Section[] = [...baseSections, ...noteSections];

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

  getProfileSections(profileId)
    .then(results => {
      console.log('>>> getProfileSections', results);
    })
    .catch(error => {
      console.error('Error fetching profile sections:', error);
    });

  return (
    <DetailsWrapper>
      <Column>
        <Bold>
          <Template code="Profile-DetailsHeader" />
        </Bold>
      </Column>

      {sections.map(section => (
        <div key={section.title}>{renderSection(section)}</div>
      ))}
      <hr />
    </DetailsWrapper>
  );
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => {
  const { profileId, task } = ownProps;
  const taskId = task.taskSid;
  return {
    openFlagEditModal: () => {
      dispatch(newOpenModalAction({ route: 'profileFlagEdit', id: profileId }, taskId));
    },
    openNoteEditModal: id => {
      dispatch(newOpenModalAction({ route: 'profileNoteEdit', id, profileId }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
export default connector(ProfileDetails);
