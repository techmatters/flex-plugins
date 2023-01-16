import * as Flex from '@twilio/flex-ui';
import React from 'react';

import ReferrableResourceSideLink from './ReferrableResourceSideLink';
import ViewResource from './ViewResource';
import { referrableResourcesEnabled } from '../../services/ResourceService';

export const setUpReferrableResources = () => {
  if (referrableResourcesEnabled()) {
    Flex.ViewCollection.Content.add(
      <Flex.View name="referrable-resources" key="referrable-resources-view">
        <ViewResource resourceId="TEST_RESOURCE_ID" />
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
