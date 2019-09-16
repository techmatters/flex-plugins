import React from 'react';
import { SideLink, Actions } from '@twilio/flex-ui';

const RecentContactsSidebarButton = ({ activeView }) => {
  function navigate() {
    Actions.invokeAction('NavigateToView', { viewName: 'recent-contacts' });
  }

  return (
    <SideLink
      showLabel={true}
      icon="Info"
      iconActive="InfoBold"
      isActive={activeView === 'custom-view'}
      onClick={navigate}
    >
      Custom View
    </SideLink>
  )
}
export default RecentContactsSidebarButton;