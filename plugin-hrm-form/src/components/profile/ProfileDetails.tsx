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
import { Template } from '@twilio/flex-ui';
import ProfileIcon from '@material-ui/icons/AccountCircleOutlined';

import { HorizontalLine, Title, Bold } from '../../styles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfile } from '../../states/profile/hooks';
import useProfileSectionTypes from '../../states/configuration/hooks/useProfileSectionTypes';
import { ProfileCommonProps } from './types';
import { DetailsWrapper, SectionHeader } from './styles';
import ProfileFlagSection from './profileFlag/ProfileFlagSection';
import { getInitializedCan, PermissionActions } from '../../permissions';
import ProfileDetailsSection from './section/ProfileDetailsSection';
import ProfileSectionGroup from './section/ProfileSectionGroup';

type OwnProps = ProfileCommonProps;

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => {
  const { profileId, task } = ownProps;
  const taskId = task.taskSid;
  return {
    openSectionEditModal: (type: string) => {
      dispatch(newOpenModalAction({ route: 'profileSectionEdit', type, profileId }, taskId));
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
  const sectionTypesForms = useProfileSectionTypes();

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  const overviewSections: Section[] = [
    {
      titleCode: 'Profile-IdentifiersHeader',
      renderComponent: () =>
        profile?.identifiers ? (
          profile.identifiers?.map(identifier => (
            <>
              {maskIdentifiers ? (
                <Bold>
                  <Template code="MaskIdentifiers" />
                </Bold>
              ) : (
                <div key={identifier.id}>{identifier.identifier}</div>
              )}
            </>
          ))
        ) : (
          <Template code="Profile-NoIdentifiersFound" />
        ),
    },
    {
      titleCode: 'Profile-StatusHeader',
      renderComponent: () => <ProfileFlagSection profileId={profileId} task={task} />,
    },
  ];

  const renderOverviewSection = (element: Section) => {
    if (!element) return null;

    return <ProfileDetailsSection titleCode={element.titleCode}>{element.renderComponent()}</ProfileDetailsSection>;
  };

  return (
    <DetailsWrapper>
      <Title>
        <ProfileIcon style={{ marginRight: '4px' }} /> #{profileId}
      </Title>
      <SectionHeader>
        <Template code="Profile-DetailsHeader-Overview" />
      </SectionHeader>
      {overviewSections.map(section => renderOverviewSection(section))}
      <HorizontalLine />
      <SectionHeader>
        <Template code="Profile-DetailsHeader-Notes" />
      </SectionHeader>
      {sectionTypesForms.map(s => (
        <ProfileSectionGroup
          key={s.label}
          handleEdit={() => openSectionEditModal(s.name)}
          profileId={profileId}
          sectionType={s}
          task={task}
          titleCode={s.label}
        />
      ))}
      <HorizontalLine />
    </DetailsWrapper>
  );
};

export default connector(ProfileDetails);
