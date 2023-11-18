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
import { Icon, Template } from '@twilio/flex-ui';

import { ProfileCommonProps } from './types';
import ProfileFlagList from './profileFlag/ProfileFlagList';
import ProfileFlagEdit from './profileFlag/ProfileFlagEdit';
import { DetailsWrapper, ProfileSectionWrapper, ProfileSectionSubtitle, ProfileSectionEditButton } from './styles';
import { Bold, Box, Column, Row } from '../../styles/HrmStyles';
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
  inInlineEditMode?: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileDetails: React.FC<Props> = ({ profileId, task, openFlagEditModal, openSectionEditModal }) => {
  const { profile } = useProfile({ profileId });
  const [shouldEditProfileFlags, setShouldEditProfileFlags] = useState(false);

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
      renderComponent: () =>
        shouldEditProfileFlags ? (
          <ProfileFlagEdit profileId={profileId} task={task} />
        ) : (
          <ProfileFlagList profileId={profileId} task={task} />
        ),
      handleEdit: () => setShouldEditProfileFlags(!shouldEditProfileFlags),
      inInlineEditMode: shouldEditProfileFlags,
    },
  ];

  const sectionTypes = [
    {
      name: 'summary',
      placeholder: 'Enter a summary of the case',
    },
    {
      name: 'recommended approach',
      placeholder: 'Enter the recommended approach',
    },
    {
      name: 'details',
      placeholder: 'Enter the details',
    },
  ];
  const sectionSections: Section[] = sectionTypes.map(sectionType => ({
    title: `${sectionType.name}`,
    margin: '20px 0',
    renderComponent: () => <ProfileSectionView profileId={profileId} task={task} sectionType={sectionType} />,
    handleEdit: () => openSectionEditModal(sectionType.name),
  }));
  const sections = [...baseSections, ...sectionSections];

  const renderEditButton = section => {
    if (!section || !section.handleEdit) return null;

    let icon = null;
    if (section.hasOwnProperty('inInlineEditMode') && section.inInlineEditMode) {
      icon = 'Close';
    }

    return (
      <ProfileSectionEditButton onClick={section.handleEdit}>
        {icon && <Icon icon={icon} />}
        {!icon && <Template code="Profile-EditButton" />}
      </ProfileSectionEditButton>
    );
  };

  return (
    <DetailsWrapper>
      <Column>
        <Bold>
          <Template code="Profile-DetailsHeader" />
        </Bold>
      </Column>
      {baseSections.map(section => (
        <div key={section.title}>
          <ProfileSectionWrapper>
            <Box marginBottom="5px">
              <Row>
                <ProfileSectionSubtitle>
                  {section.titleCode ? <Template code={section.titleCode} /> : section.title}
                </ProfileSectionSubtitle>
                {renderEditButton(section)}
              </Row>
            </Box>
            <Box margin={section.margin}>{section.renderComponent()}</Box>
          </ProfileSectionWrapper>
        </div>
      ))}
      <hr />
      <h2>Notes</h2>
      {sectionSections.map(section => (
        <div key={section.title}>
          <ProfileSectionWrapper>
            <Box marginBottom="5px">
              <Row>
                <ProfileSectionSubtitle>
                  {section.titleCode ? <Template code={section.titleCode} /> : section.title}
                </ProfileSectionSubtitle>
                {renderEditButton(section)}
              </Row>
            </Box>
            <Box margin={section.margin}>{section.renderComponent()}</Box>
          </ProfileSectionWrapper>
        </div>
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
    openSectionEditModal: (type: string) => {
      dispatch(newOpenModalAction({ route: 'profileSectionEdit', type, id: profileId }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
export default connector(ProfileDetails);
