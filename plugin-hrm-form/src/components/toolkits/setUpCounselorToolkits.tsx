import * as Flex from '@twilio/flex-ui';
import React from 'react';

import CounselorToolkitSideLink from './CounselorToolkitSideLink';
import { getConfig } from '../../HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
export const setUpCounselorToolkits = () => {
  const { featureFlags } = getConfig();
  // eslint-disable-next-line no-unused-expressions
  featureFlags.enable_counselor_toolkits &&
    Flex.SideNav.Content.add(
      <CounselorToolkitSideLink key="CounselorToolkitSideLink" showLabel={true} reserveSpace={false} />,
    );
};
