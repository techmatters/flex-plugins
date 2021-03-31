/* eslint-disable react/prop-types */
/*
 * This component was in the original mockup designs, we're removing it per ZA request, but could be useful for other helplines.
 */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './styles';
import { getConfig } from '../../../HrmFormPlugin';
import { mapChannel, mapChannelForInsights } from '../../../utils';
import { presentValue, formatStringToDateAndTime } from '../../../utils/formatters';

type OwnProps = {
  sectionName: string;
  contact: any;
  counselor: string;
};

type Props = OwnProps;

const CasePrintContact: React.FC<Props> = ({ sectionName, contact, counselor }) => {
  const { strings } = getConfig();

  const { rawJson, channel, number, conversationDuration, timeOfContact } = contact;

  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(rawJson.contactlessTask?.channel) : mapChannel(channel);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{sectionName}</Text>
      </View>
      <View style={styles.sectionBody}>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-ContactSummary']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(rawJson.caseInformation?.callSummary)}</Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-Channel']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{formattedChannel}</Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-PhoneNumber']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(number)}</Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-Conversation']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(conversationDuration)}</Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-Counselor']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(counselor)}</Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-DateTime']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{formatStringToDateAndTime(timeOfContact)}</Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-RepeatCaller']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(rawJson.caseInformation?.repeatCaller)} </Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-ReferredTo']}</Text>
          <Text style={styles.sectionItemSecondColumn}>{presentValue(rawJson.caseInformation?.referredTo)}</Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-ChildHearAboutUs']}</Text>
          <Text style={styles.sectionItemSecondColumn}>
            {presentValue(rawJson.caseInfomation?.howDidTheChildHearAboutUs)}
          </Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-KeepConfidential']}</Text>
          <Text style={styles.sectionItemSecondColumn}> {presentValue(rawJson.caseInfomation?.keepConfidential)}</Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-OKToCall']}</Text>
          <Text style={styles.sectionItemSecondColumn}>
            {presentValue(rawJson.caseInfomation?.okForCaseWorkerToCall)}
          </Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-DiscussRights']}</Text>
          <Text style={styles.sectionItemSecondColumn}>
            {presentValue(rawJson.caseInfomation?.didYouDiscussRightsWithTheChild)}
          </Text>
        </View>
        <View style={styles.sectionItemRowOdd}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-SolvedProblem']}</Text>
          <Text style={styles.sectionItemSecondColumn}>
            {presentValue(rawJson.caseInfomation?.didTheChildFeelWeSolvedTheirProblem)}
          </Text>
        </View>
        <View style={styles.sectionItemRowEven}>
          <Text style={styles.sectionItemFirstColumn}>{strings['ContactDetails-GeneralDetails-WouldRecommend']}</Text>
          <Text style={styles.sectionItemSecondColumn}>
            {presentValue(rawJson.caseInfomation?.wouldTheChildRecommendUsToAFriend)}
          </Text>
        </View>
      </View>
    </View>
  );
};

CasePrintContact.displayName = 'CasePrintContact';

// eslint-disable-next-line import/no-unused-modules
export default CasePrintContact;
