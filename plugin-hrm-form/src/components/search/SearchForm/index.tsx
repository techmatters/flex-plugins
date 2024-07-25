/* eslint-disable sonarjs/cognitive-complexity */
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

/* eslint-disable no-empty-function */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import FieldDate from '../../FieldDate';
import {
  Bold,
  BottomButtonBar,
  Box,
  Container,
  FormCheckbox,
  FormCheckBoxWrapper,
  FormLabel,
  Row,
} from '../../../styles';
import { PrimaryButton } from '../../../styles/buttons';
import { getContactValueTemplate, getFormattedNumberFromTask, getNumberFromTask } from '../../../utils';
import {
  canOnlyViewOwnCases,
  canOnlyViewOwnContacts,
  getInitializedCan,
  PermissionActions,
} from '../../../permissions';
import { channelTypes } from '../../../states/DomainConstants';
import { SearchFormValues } from '../../../states/search/types';
import { getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import { RootState } from '../../../states';
import selectPreviousContactCounts from '../../../states/search/selectPreviousContactCounts';
import { selectCounselorsList } from '../../../states/configuration/selectCounselorsHash';
import { selectCurrentDefinitionVersion } from '../../../states/configuration/selectDefinitions';
import { CustomITask } from '../../../types/types';
import selectContextContactId from '../../../states/contacts/selectContextContactId';

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

type OwnProps = {
  handleSearch: (searchParams: any) => void;
  handleSearchFormChange: (fieldName: string, value: string) => void;
  values: SearchFormValues;
  task: ITask | CustomITask;
};

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const contactId = selectContextContactId(state, task.taskSid, 'search', 'form');
  return {
    counselors: selectCounselorsList(state),
    helplineInformation: selectCurrentDefinitionVersion(state)?.helplineInformation,
    previousContactCounts: selectPreviousContactCounts(state, task.taskSid, `contact-${contactId}`) ?? {
      contacts: 0,
      cases: 0,
    },
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

// eslint-disable-next-line complexity
const SearchForm: React.FC<Props> = ({
  values,
  counselors,
  previousContactCounts: { contacts: contactsCount, cases: casesCount },
  handleSearchFormChange,
  helplineInformation,
  task,
  handleSearch,
}) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const defaultEventHandlers = fieldName => ({
    handleChange: e => {
      handleSearchFormChange(fieldName, e.target.value);
    },
    handleBlur: () => {},
    handleFocus: () => {},
  });

  const showPreviousContactsCheckbox = () => {
    return contactsCount > 0 || casesCount > 0;
  };

  const { firstName, lastName, counselor, helpline, phoneNumber, dateFrom, dateTo, contactNumber } = values;

  const counselorsOptions = counselors.map(e => ({
    label: e.fullName,
    value: e.sid,
  }));

  if (!helplineInformation) return null;

  const helplineOptions = helplineInformation?.helplines ?? [];
  const strings = getTemplateStrings();
  const { helpline: userHelpline, multipleOfficeSupport } = getHrmConfig();
  const searchParams = {
    ...values,
    counselor: typeof values.counselor === 'string' ? values.counselor : values.counselor?.value, // backend expects only counselor's SID
    // If the user already has a helpline attribute we will hide the dropdown and send the userHelpline to the API
    helpline: multipleOfficeSupport && helpline?.value ? helpline.value : userHelpline,
    onlyDataContacts: false,
    closedCases: true,
  };

  const isTouched =
    firstName || lastName || typeof values.counselor === 'string'
      ? values.counselor
      : values.counselor?.value || phoneNumber || dateFrom || dateTo || (helpline && helpline.value) || contactNumber;

  const submitSearch = () => {
    handleSearch(searchParams);
  };
  const submitOnEnter = event => {
    if (event.key === 'Enter') submitSearch();
  };

  const contactNumberFromTask = getNumberFromTask(task);
  const checkBoxName = getFormattedNumberFromTask(task);

  const handleChangePreviousContactsCheckbox = () => {
    const value = contactNumber === '' ? contactNumberFromTask : '';
    handleSearchFormChange('contactNumber', value);
  };
  const webChatTemplate = getContactValueTemplate(task);
  const localizedSource = {
    [channelTypes.web]: webChatTemplate,
    [channelTypes.voice]: 'PreviousContacts-PhoneNumber',
    [channelTypes.sms]: 'PreviousContacts-PhoneNumber',
    [channelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
    [channelTypes.facebook]: 'PreviousContacts-FacebookUser',
    [channelTypes.telegram]: 'PreviousContacts-TelegramUser',
    [channelTypes.instagram]: 'PreviousContacts-InstagramUser',
    [channelTypes.line]: 'PreviousContacts-LineUser',
  };

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  const canChooseCounselor = !(canOnlyViewOwnContacts() || canOnlyViewOwnCases());

  return (
    <>
      <Container data-testid="SearchForm" formContainer={true} style={{ borderBottom: 'none' }}>
        <Row>
          <FieldText
            id="Search_FirstName"
            label={strings['SearchForm-Name']}
            placeholder={strings['SearchForm-First']}
            field={getField(firstName)}
            {...defaultEventHandlers('firstName')}
            style={{ marginRight: 25 }}
            onKeyPress={submitOnEnter}
          />
          <FieldText
            id="Search_LastName"
            placeholder={strings['SearchForm-Last']}
            field={getField(lastName)}
            {...defaultEventHandlers('lastName')}
            onKeyPress={submitOnEnter}
          />
        </Row>

        <Row>
          {canChooseCounselor && (
            <FieldSelect
              id="Search_Counselor"
              name="counselor"
              label={strings['SearchForm-Counselor']}
              placeholder={strings['SearchForm-Name']}
              field={getField(counselor ?? '')}
              options={[{ label: '', value: '' }, ...counselorsOptions]}
              {...defaultEventHandlers('counselor')}
              style={{ marginRight: 25 }}
            />
          )}
          <FieldDate
            id="Search_DateFrom"
            label={strings['SearchForm-DateRange']}
            placeholder={strings['SearchForm-Start']}
            field={getField(dateFrom)}
            {...defaultEventHandlers('dateFrom')}
          />
          <FieldDate
            id="Search_DateTo"
            label=" "
            placeholder={strings['SearchForm-End']}
            field={getField(dateTo)}
            {...defaultEventHandlers('dateTo')}
          />
        </Row>
        <Row>
          <FieldText
            id="Search_CustomerPhoneNumber"
            label={strings['SearchForm-Phone']}
            field={getField(phoneNumber)}
            {...defaultEventHandlers('phoneNumber')}
            onKeyPress={submitOnEnter}
            style={{ marginRight: 25 }}
          />
          {/* If the user has their helpline attribute set, we don't need to show the Office search criteria. */}
          {multipleOfficeSupport && !userHelpline && helplineOptions.length > 0 && (
            <FieldSelect
              id="Search_Office"
              name="office"
              label={helplineInformation.label}
              placeholder="--"
              field={getField(helpline ?? '')}
              options={[{ label: '', value: '' }, ...helplineOptions]}
              {...defaultEventHandlers('helpline')}
            />
          )}
        </Row>
        {showPreviousContactsCheckbox() && (
          <Row>
            <Box marginTop="20px">
              <FormLabel htmlFor="Search_PreviousContacts">
                <FormCheckBoxWrapper data-testid="Search-PreviousContactsCheckbox">
                  <Box marginRight="5px">
                    <FormCheckbox
                      id="Search_PreviousContacts"
                      type="checkbox"
                      defaultChecked={Boolean(contactNumber)}
                      onChange={handleChangePreviousContactsCheckbox}
                    />
                  </Box>
                  <span>
                    <Template code="PreviousContacts-OnlyShowRecordsFrom" />{' '}
                    <Template code={localizedSource[task.channelType]} />{' '}
                    {maskIdentifiers ? (
                      <Bold>
                        <Template code="MaskIdentifiers" />
                      </Bold>
                    ) : (
                      <Bold>{checkBoxName}</Bold>
                    )}
                  </span>
                </FormCheckBoxWrapper>
              </FormLabel>
            </Box>
          </Row>
        )}
      </Container>
      <BottomButtonBar>
        <PrimaryButton type="button" disabled={!isTouched} roundCorners={true} onClick={submitSearch}>
          <Template code="SearchForm-Button" />
        </PrimaryButton>
      </BottomButtonBar>
    </>
  );
};

const connector = connect(mapStateToProps);
const connected = connector(SearchForm);

export default connected;
