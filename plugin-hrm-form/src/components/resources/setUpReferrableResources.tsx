import * as Flex from '@twilio/flex-ui';
import React from 'react';

import ReferrableResourceSideLink from './ReferrableResourceSideLink';
import { referrableResourcesEnabled } from '../../services/ResourceService';
import ReferrableResources from './ReferrableResources';

export const setUpReferrableResources = () => {
  if (referrableResourcesEnabled()) {
    Flex.ViewCollection.Content.add(
      <Flex.View name="referrable-resources" key="referrable-resources-view">
        <ReferrableResources />
      </Flex.View>,
    );

    Flex.SideNav.Content.add(
      <ReferrableResourceSideLink
        key="ReferrableResourceSideLink"
        onClick={() => Flex.Actions.invokeAction('NavigateToView', { viewName: 'referrable-resources' })}
        reserveSpace={false}
        showLabel={true}
      />,
    );
  }
};
