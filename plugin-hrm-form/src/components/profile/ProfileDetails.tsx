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

import { ProfileCommonProps } from './types';
import ProfileFlagList from './profileFlag/ProfileFlagList';
import { DetailsWrapper, ProfileSubtitle } from './styles';
import { Bold, Box, Column, Flex } from '../../styles/HrmStyles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfile } from '../../states/profile/hooks';
import ProfileSectionView from './section/ProfileSectionView';

type OwnProps = ProfileCommonProps;

type Section = {
  titleCode?: string;
  title?: string;
  margin: string;
  renderComponent: () => React.ReactNode;
  handleEdit?: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileDetails: React.FC<Props> = ({ profileId, task, openFlagEditModal, openSectionEditModal }) => {
  const { profile } = useProfile({ profileId });

  const baseSections: Section[] = [
    {
      titleCode: 'Profile-IdentifiersHeader',
      margin: '20px 0',
      renderComponent: () =>
        profile?.identifiers ? (
          profile.identifiers?.map(identifier => <div key={identifier.id}>{identifier.identifier}</div>)
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

  const sectionTypes = ['summary', 'actions', 'recommendations'];

  const sectionSections: Section[] = sectionTypes.map(sectionType => ({
    title: `${sectionType}`,
    margin: '20px 0',
    renderComponent: () => <ProfileSectionView profileId={profileId} task={task} sectionType={sectionType} />,
    handleEdit: () => openSectionEditModal(sectionType),
  }));

  const sections = [...baseSections, ...sectionSections];

  const renderTitle = section => {
    if (section.titleCode) {
      return <Template code={section.titleCode} />;
    }

    return section.title;
  };

  const renderEditButton = section => {
    return section.handleEdit ? (
      <Box alignSelf="center">
        <IconButton icon="Edit" title="Edit" size="small" onClick={section.handleEdit} />
      </Box>
    ) : null;
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
    openSectionEditModal: type => {
      dispatch(newOpenModalAction({ route: 'profileSectionEdit', type, id: profileId }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
export default connector(ProfileDetails);
