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
import { Icon, Template } from '@twilio/flex-ui';

import { Box, HiddenText, Row, HorizontalLine } from '../../styles/HrmStyles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfile } from '../../states/profile/hooks';
import useProfileSectionTypes from '../../states/configuration/hooks/useProfileSectionTypes';
import { ProfileCommonProps } from './types';
import {
  DetailsWrapper,
  ProfileSectionWrapper,
  ProfileSectionSubtitle,
  ProfileSectionEditButton,
  SectionHeader,
} from './styles';
import ProfileFlagSection from './profileFlag/ProfileFlagSection';
import ProfileSectionView from './section/ProfileSectionView';

type OwnProps = ProfileCommonProps;

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => {
  const { profileId, task } = ownProps;
  const taskId = task.taskSid;
  return {
    openSectionEditModal: (type: string) => {
      dispatch(newOpenModalAction({ route: 'profileSectionEdit', type, id: profileId }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

type Section = {
  titleCode: string;
  renderComponent: () => React.ReactNode;
  handleEdit?: () => void;
  inInlineEditMode?: boolean;
};

const ProfileDetails: React.FC<Props> = ({ profileId, task, openSectionEditModal }) => {
  const { profile } = useProfile({ profileId });

  const overviewSections: Section[] = [
    {
      titleCode: 'Profile-IdentifiersHeader',
      renderComponent: () =>
        profile?.identifiers ? (
          profile.identifiers?.map(identifier => <div key={identifier.id}>{identifier.identifier}</div>)
        ) : (
          <Template code="Profile-NoIdentifiersFound" />
        ),
    },
    {
      titleCode: 'Profile-StatusHeader',
      renderComponent: () => <ProfileFlagSection profileId={profileId} task={task} />,
    },
  ];

  const sectionTypesForms = useProfileSectionTypes();

  const sectionSections: Section[] = sectionTypesForms.map(sectionType => ({
    titleCode: sectionType.label,
    renderComponent: () => <ProfileSectionView profileId={profileId} task={task} sectionType={sectionType} />,
    handleEdit: () => openSectionEditModal(sectionType.name),
  }));

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
        <HiddenText>
          <Template code={section.titleCode} />{' '}
        </HiddenText>
      </ProfileSectionEditButton>
    );
  };

  const renderSection = section => {
    if (!section) return null;

    return (
      <div key={section.titleCode}>
        <ProfileSectionWrapper>
          <Box marginBottom="5px">
            <Row>
              <ProfileSectionSubtitle>
                {section.titleCode ? <Template code={section.titleCode} /> : section.title}
              </ProfileSectionSubtitle>
              {renderEditButton(section)}
            </Row>
          </Box>
          <Box>{section.renderComponent()}</Box>
        </ProfileSectionWrapper>
      </div>
    );
  };

  return (
    <DetailsWrapper>
      <SectionHeader>
        <Template code="Profile-DetailsHeader-Overview" />
      </SectionHeader>
      {overviewSections.map(section => renderSection(section))}
      <HorizontalLine />
      <SectionHeader>
        <Template code="Profile-DetailsHeader-Notes" />
      </SectionHeader>
      {sectionSections.map(section => renderSection(section))}
      <HorizontalLine />
    </DetailsWrapper>
  );
};

export default connector(ProfileDetails);
