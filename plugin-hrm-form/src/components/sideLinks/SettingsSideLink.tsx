/* eslint-disable react/prop-types */
import React from 'react';
import { Template, SideLink, SideNavChildrenProps } from '@twilio/flex-ui';

type Props = SideNavChildrenProps & { showLabel: boolean; onClick: () => void };

const SettingsSideLink: React.FC<Props> = ({ showLabel, activeView, onClick }) => {
  return (
    <SideLink
      showLabel={showLabel}
      icon="Settings"
      iconActive="SettingsBold"
      isActive={activeView === 'settings'}
      onClick={onClick}
    >
      <Template code="SideNavSettings" />
    </SideLink>
  );
};

SettingsSideLink.displayName = 'SettingsSideLink';

export default SettingsSideLink;
