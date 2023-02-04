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
import { connect, ConnectedProps } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import FieldDate from '../../FieldDate';
import {
  Container,
  StyledNextStepButton,
  Row,
  BottomButtonBar,
  Box,
  FormLabel,
  FormCheckBoxWrapper,
  FormCheckbox,
  Bold,
} from '../../../styles/HrmStyles';
import { SearchTitle } from '../../../styles/search';
import { namespace, configurationBase, searchContactsBase } from '../../../states';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../../../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';
import { channelTypes } from '../../../states/DomainConstants';
import { SearchFormValues } from '../../../states/search/types';
import { getHrmConfig, getResourceStrings } from '../../../hrmConfig';

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

type OwnProps = {
  handleSearch: (searchParams: any) => void;
  handleSearchFormChange: (fieldName: string, value: string) => void;
  values: SearchFormValues & { helpline: { value: string } }; // The type of helpline is being used inconsistently, leaving as 'any' for now
  task: ITask;
};

const mapStateToProps = (state, ownProps) => ({
  counselors: state[namespace][configurationBase].counselors.list,
  helplineInformation: state[namespace][configurationBase].currentDefinitionVersion?.helplineInformation,
  previousContacts: state[namespace][searchContactsBase].tasks[ownProps.task.taskSid]?.previousContacts,
});

const connector = connect(mapStateToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const SearchForm: React.FC<Props> = ({
  values,
  counselors,
  previousContacts = null,
  handleSearchFormChange,
  helplineInformation,
  task,
  handleSearch,
}) => {
  const defaultEventHandlers = fieldName => ({
    handleChange: e => {
      handleSearchFormChange(fieldName, e.target.value);
    },
    handleBlur: () => {},
    handleFocus: () => {},
  });

  const showPreviousContactsCheckbox = () => {
    const contactsCount = previousContacts?.contacts?.count || 0;
    const casesCount = previousContacts?.cases?.count || 0;

    return contactsCount > 0 || casesCount > 0;
  };

  const { firstName, lastName, counselor, helpline, phoneNumber, dateFrom, dateTo, contactNumber } = values;

  const counselorsOptions = counselors.map(e => ({
    label: e.fullName,
    value: e.sid,
  }));

  const helplineOptions =
    helplineInformation && helplineInformation.helplines
      ? helplineInformation.helplines.map(h => ({
          label: h.label,
          value: h.value,
        }))
      : [];
  const strings = getResourceStrings();
  const { helpline: userHelpline, multipleOfficeSupport } = getHrmConfig();
  const searchParams = {
    ...values,
    counselor: counselor.value, // backend expects only counselor's SID
    // If the user already has a helpline attribute we will hide the dropdown and send the userHelpline to the API
    helpline: multipleOfficeSupport && helpline?.value ? helpline.value : userHelpline,
    onlyDataContacts: false,
    closedCases: true,
  };

  const isTouched =
    firstName ||
    lastName ||
    (counselor && counselor.value) ||
    phoneNumber ||
    dateFrom ||
    dateTo ||
    (helpline && helpline.value) ||
    contactNumber;

  const submitSearch = () => handleSearch(searchParams);
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
    [channelTypes.twitter]: 'PreviousContacts-TwitterUser',
    [channelTypes.instagram]: 'PreviousContacts-InstagramUser',
    [channelTypes.line]: 'PreviousContacts-LineUser',
  };

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <>
      <Container data-testid="SearchForm">
        <SearchTitle data-testid="Search-Title">
          <Template code="SearchContactsAndCases-Title" />
        </SearchTitle>
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
          <FieldSelect
            id="Search_Counselor"
            name="counselor"
            label={strings['SearchForm-Counselor']}
            placeholder={strings['SearchForm-Name']}
            field={getField(counselor)}
            options={[{ label: '', value: '' }, ...counselorsOptions]}
            {...defaultEventHandlers('counselor')}
            style={{ marginRight: 25 }}
          />
          <FieldDate
            id="Search_DateFrom"
            label={strings['SearchForm-DateRange']}
            placeholder={strings['SearchForm-Start']}
            field={getField(dateFrom)}
            {...defaultEventHandlers('dateFrom')}
            style={{ marginRight: '10px' }}
          />
          <FieldDate
            id="Search_DateTo"
            label=" "
            placeholder={strings['SearchForm-End']}
            field={getField(dateTo)}
            {...defaultEventHandlers('dateTo')}
            style={{ marginRight: '10px' }}
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
        {showPreviousContactsCheckbox && (
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
        <StyledNextStepButton type="button" disabled={!isTouched} roundCorners={true} onClick={submitSearch}>
          <Template code="SearchForm-Button" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </>
  );
};

export default connector(SearchForm);
