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
import { Template } from '@twilio/flex-ui';

import { BannerContainer, Text, BannerActionLink } from './styles';
import InfoIcon from './InfoIcon';

type OwnProps = {
  caseId: string;
  cancelCase: () => void;
};

type Props = OwnProps;

const ContactAddedToCaseBanner: React.FC<Props> = ({ caseId, cancelCase }) => {
  return (
    <BannerContainer color="blue">
      <InfoIcon />
      <Text>
        <Template code="CaseMerging-CaseCreatedAndContactAdded" caseId={caseId} />
      </Text>
      <BannerActionLink type="button" onClick={cancelCase}>
        <Template code="CaseMerging-CancelCase" />
      </BannerActionLink>
    </BannerContainer>
  );
};

export default ContactAddedToCaseBanner;
