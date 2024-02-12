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

/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
/*
 * This component was in the original mockup designs, we're removing it per ZA request, but could be useful for other helplines.
 */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './styles';
import { mapChannel, mapChannelForInsights, formatStringToDateAndTime } from '../../../utils';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { presentValueFromStrings } from './presentValuesFromStrings';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  sectionName: string;
  contact: any;
  counselor: string;
};

type Props = OwnProps;

const CasePrintContact: React.FC<Props> = ({ sectionName, contact, counselor }) => {
  const strings = getTemplateStrings();
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const { rawJson, channel, number, conversationDuration, timeOfContact } = contact;

  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(rawJson.contactlessTask?.channel) : mapChannel(channel);

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{sectionName}</Text>
      </View>
      <View style={styles['sectionBody']}>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>
            {strings['ContactDetails-GeneralDetails-ContactSummary']}
          </Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInformation?.callSummary)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-Channel']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>{formattedChannel}</Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-PhoneNumber']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {maskIdentifiers ? strings.MaskIdentifers : presentValueFromStrings(strings)(number)}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>
            {strings['ContactDetails-GeneralDetails-ConversationDuration']}
          </Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(conversationDuration)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-Counselor']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>{presentValueFromStrings(strings)(counselor)()}</Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-DateTime']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>{formatStringToDateAndTime(timeOfContact)}</Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-RepeatCaller']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInformation?.repeatCaller)()}{' '}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-ReferredTo']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInformation?.referredTo)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>
            {strings['ContactDetails-GeneralDetails-ChildHearAboutUs']}
          </Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.howDidTheChildHearAboutUs)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>
            {strings['ContactDetails-GeneralDetails-KeepConfidential']}
          </Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {' '}
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.keepConfidential)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-OKToCall']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.okForCaseWorkerToCall)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-DiscussRights']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.didYouDiscussRightsWithTheChild)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowOdd']}>
          <Text style={styles['sectionItemFirstColumn']}>{strings['ContactDetails-GeneralDetails-SolvedProblem']}</Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.didTheChildFeelWeSolvedTheirProblem)()}
          </Text>
        </View>
        <View style={styles['sectionItemRowEven']}>
          <Text style={styles['sectionItemFirstColumn']}>
            {strings['ContactDetails-GeneralDetails-WouldRecommend']}
          </Text>
          <Text style={styles['sectionItemSecondColumn']}>
            {presentValueFromStrings(strings)(rawJson.caseInfomation?.wouldTheChildRecommendUsToAFriend)()}
          </Text>
        </View>
      </View>
    </View>
  );
};

CasePrintContact.displayName = 'CasePrintContact';

// eslint-disable-next-line import/no-unused-modules
export default CasePrintContact;
