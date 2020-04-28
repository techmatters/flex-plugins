import React from 'react';
import PropTypes from 'prop-types';
import { Template, SideLink } from '@twilio/flex-ui';

const SettingsSideLink = props => {
  console.log('SettingsSideLink', props);
  const { showLabel, activeView, onClick } = props;
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
SettingsSideLink.propTypes = {
  showLabel: PropTypes.bool.isRequired,
  activeView: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SettingsSideLink;
