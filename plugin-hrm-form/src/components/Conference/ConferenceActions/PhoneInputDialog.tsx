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
import { Template, Manager, Tab as TwilioTab } from '@twilio/flex-ui';
import { Phone as PhoneIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import { Row, Bold, CloseButton, PrimaryButton } from '../../../styles';
import {
  PhoneDialogWrapper,
  PhoneDialogFooter,
  PhoneDialogContent,
  PhoneNumberInput,
  QuickDialSelect,
  HelpText,
} from './styles';
import type { QuickDialOption } from '../../../states/configuration/reducer';
import { lookupTranslation } from '../../../translations';
import { StyledTabs } from '../../search/styles';
import useFocus from '../../../utils/useFocus';

type PhoneDialogProps = {
  targetNumber: string;
  setTargetNumber: (targetNumber: string) => void;
  handleClick: () => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  isLoading: boolean;
  quickDialOptions: QuickDialOption[];
  enableManualDial: boolean;
};

type TabValue = 'quickDial' | 'enterNumber';

const ENTER_NUMBER_KEY = 'Conference-EnterPhoneNumber';
const QUICK_DIAL_TAB_KEY = 'Conference-QuickDialTab';
const ENTER_NUMBER_TAB_KEY = 'Conference-EnterNumberTab';
const PHONE_NUMBER_EXAMPLE_KEY = 'Conference-PhoneNumberExample';
const QUICK_DIAL_SELECT_LABEL_KEY = 'Conference-QuickDialSelectLabel';

const PhoneInputDialog: React.FC<PhoneDialogProps> = ({
  targetNumber,
  setTargetNumber,
  handleClick,
  setIsDialogOpen,
  isLoading,
  quickDialOptions,
  enableManualDial,
}) => {
  const hasQuickDial = quickDialOptions && quickDialOptions.length > 0;
  const showTabs = hasQuickDial && enableManualDial;

  const defaultTab: TabValue = hasQuickDial ? 'quickDial' : 'enterNumber';
  const [activeTab, setActiveTab] = React.useState<TabValue>(defaultTab);

  React.useEffect(() => {
    if (hasQuickDial) {
      setTargetNumber(quickDialOptions[0].phoneNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusRef = useFocus();

  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);
    if (value === 'quickDial' && quickDialOptions.length > 0) {
      setTargetNumber(quickDialOptions[0].phoneNumber);
    } else if (value === 'enterNumber') {
      setTargetNumber('');
    }
  };

  const handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTargetNumber(e.target.value);
  };

  const handleQuickDialChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    setTargetNumber(e.target.value);
  };

  const isDialButtonDisabled = isLoading || (activeTab === 'enterNumber' && !targetNumber?.trim());
  const renderQuickDial = () => (
    <PhoneDialogContent>
      <QuickDialSelect
        value={targetNumber}
        onChange={handleQuickDialChange}
        disabled={isLoading}
        aria-label={Manager.getInstance().strings[QUICK_DIAL_SELECT_LABEL_KEY]}
      >
        {quickDialOptions.map(option => (
          <option key={option.phoneNumber} value={option.phoneNumber}>
            {lookupTranslation(option.labelKey)}
          </option>
        ))}
      </QuickDialSelect>
    </PhoneDialogContent>
  );
  const renderManualDial = () => (
    <PhoneDialogContent>
      <PhoneNumberInput
        type="text"
        id="number-input"
        value={targetNumber}
        onChange={handleNumberChange}
        disabled={isLoading}
        aria-label={Manager.getInstance().strings[ENTER_NUMBER_KEY]}
      />
      <HelpText>{lookupTranslation(PHONE_NUMBER_EXAMPLE_KEY)}</HelpText>
    </PhoneDialogContent>
  );
  return (
    <PhoneDialogWrapper>
      <Row>
        <Bold>
          <Template code="Conference-AddConferenceCallParticipant" />
        </Bold>
        <CloseButton
          buttonRef={focusRef}
          onClick={() => setIsDialogOpen(false)}
          aria-label="CloseButton"
          style={{ marginLeft: 'auto', marginRight: 0, paddingRight: 0 }}
        />
      </Row>
      {showTabs ? (
        <div
          style={{
            height: '108px',
          }}
        >
          <StyledTabs
            selectedTabName={activeTab}
            onTabSelected={handleTabChange}
            alignment="center"
            keepTabsMounted={false}
          >
            <TwilioTab uniqueName="quickDial" label={<Template code={QUICK_DIAL_TAB_KEY} />} key="quickDial">
              {hasQuickDial && renderQuickDial()}
            </TwilioTab>
            <TwilioTab uniqueName="enterNumber" label={<Template code={ENTER_NUMBER_TAB_KEY} key="enterNumber" />}>
              {enableManualDial && renderManualDial()}
            </TwilioTab>
          </StyledTabs>
        </div>
      ) : (
        <>
          {hasQuickDial && renderQuickDial()}
          {enableManualDial && renderManualDial()}
        </>
      )}
      <PhoneDialogFooter>
        <PrimaryButton autoFocus onClick={handleClick} disabled={isDialButtonDisabled}>
          {isLoading ? (
            <CircularProgress size={16} style={{ color: '#fff' }} />
          ) : (
            <>
              <PhoneIcon fontSize="small" style={{ marginRight: '6px' }} />
              <Template code="Conference-DialButton" />
            </>
          )}
        </PrimaryButton>
      </PhoneDialogFooter>
    </PhoneDialogWrapper>
  );
};

export default PhoneInputDialog;
