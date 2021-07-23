/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes, { string } from 'prop-types';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

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
import { searchFormType, taskType } from '../../../types';
import { getConfig } from '../../../HrmFormPlugin';
import { namespace, configurationBase, searchContactsBase, contactFormsBase } from '../../../states';
import { getNumberFromTask } from '../../../services/ContactService';
import { localizedSource } from '../../PreviousContactsBanner';
import { formatNumberFromTask } from '../../../utils/formatters';

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

class SearchForm extends Component {
  static displayName = 'SearchForm';

  static propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleSearchFormChange: PropTypes.func.isRequired,
    counselors: PropTypes.arrayOf(
      PropTypes.shape({
        fullName: PropTypes.string,
        sid: PropTypes.string,
      }),
    ).isRequired,
    helpline: string,
    helplineInformation: PropTypes.shape({
      label: string,
      helplines: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          manager: PropTypes.shape({
            name: string,
            phone: string,
            email: string,
          }),
        }),
      ),
    }),
    values: searchFormType.isRequired,
    task: taskType.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    previousContacts: PropTypes.any, // TODO: Transform this file into Typescript
  };

  static defaultProps = {
    previousContacts: null,
  };

  defaultEventHandlers = fieldName => ({
    handleChange: e => {
      this.props.handleSearchFormChange(fieldName, e.target.value);
    },
    handleBlur: () => {},
    handleFocus: () => {},
  });

  get showPreviousContactsCheckbox() {
    const { previousContacts } = this.props;
    const contactsCount = previousContacts?.contacts?.count || 0;
    const casesCount = previousContacts?.cases?.count || 0;

    return contactsCount > 0 || casesCount > 0;
  }

  render() {
    const {
      firstName,
      lastName,
      counselor,
      helpline,
      phoneNumber,
      dateFrom,
      dateTo,
      contactNumber,
    } = this.props.values;

    const counselorsOptions = this.props.counselors.map(e => ({
      label: e.fullName,
      value: e.sid,
    }));

    const helplineOptions =
      this.props.helplineInformation && this.props.helplineInformation.helplines
        ? this.props.helplineInformation.helplines.map(h => ({
            label: h.label,
            value: h.value,
          }))
        : [];

    const { helpline: userHelpline, strings, multipleOfficeSupport } = getConfig();
    const searchParams = {
      ...this.props.values,
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

    const submitSearch = () => this.props.handleSearch(searchParams);
    const submitOnEnter = event => {
      if (event.key === 'Enter') submitSearch();
    };

    const { task } = this.props;

    const contactNumberFromTask = getNumberFromTask(task);
    const checkBoxName = formatNumberFromTask(task);

    const handleChangePreviousContactsCheckbox = () => {
      const value = contactNumber === '' ? contactNumberFromTask : '';
      this.props.handleSearchFormChange('contactNumber', value);
    };

    const source = localizedSource[task.channelType];

    return (
      <>
        <Container>
          <SearchTitle data-testid="Search-Title">
            <Template code="SearchContactsAndCases-Title" />
          </SearchTitle>
          <Row>
            <FieldText
              id="Search_FirstName"
              label={strings['SearchForm-Name']}
              placeholder={strings['SearchForm-First']}
              field={getField(firstName)}
              {...this.defaultEventHandlers('firstName')}
              style={{ marginRight: 25 }}
              onKeyPress={submitOnEnter}
            />
            <FieldText
              id="Search_LastName"
              placeholder={strings['SearchForm-Last']}
              field={getField(lastName)}
              {...this.defaultEventHandlers('lastName')}
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
              {...this.defaultEventHandlers('counselor')}
              style={{ marginRight: 25 }}
            />
            <FieldDate
              id="Search_DateFrom"
              label={strings['SearchForm-DateRange']}
              placeholder={strings['SearchForm-Start']}
              field={getField(dateFrom)}
              {...this.defaultEventHandlers('dateFrom')}
              style={{ marginRight: '10px' }}
            />
            <FieldDate
              id="Search_DateTo"
              label=" "
              placeholder={strings['SearchForm-End']}
              field={getField(dateTo)}
              {...this.defaultEventHandlers('dateTo')}
              style={{ marginRight: '10px' }}
            />
          </Row>
          <Row>
            <FieldText
              id="Search_CustomerPhoneNumber"
              label={strings['SearchForm-Phone']}
              field={getField(phoneNumber)}
              {...this.defaultEventHandlers('phoneNumber')}
              onKeyPress={submitOnEnter}
              style={{ marginRight: 25 }}
            />
            {/* If the user has their helpline attribute set, we don't need to show the Office search criteria. */}
            {multipleOfficeSupport && !userHelpline && helplineOptions.length > 0 && (
              <FieldSelect
                id="Search_Office"
                name="office"
                label={this.props.helplineInformation.label}
                placeholder="--"
                field={getField(helpline)}
                options={[{ label: '', value: '' }, ...helplineOptions]}
                {...this.defaultEventHandlers('helpline')}
              />
            )}
          </Row>
          {this.showPreviousContactsCheckbox && (
            <Row>
              <Box marginTop="20px">
                <FormLabel htmlFor="Search_PreviousContacts">
                  <FormCheckBoxWrapper data-testid="Search-PreviousContactsCheckbox">
                    <Box marginRight="5px">
                      <FormCheckbox
                        id="Search_PreviousContacts"
                        type="checkbox"
                        defaultChecked={contactNumber}
                        onChange={handleChangePreviousContactsCheckbox}
                      />
                    </Box>
                    <span>
                      <Template code="PreviousContacts-OnlyShowRecordsFrom" /> <Template code={source} />{' '}
                      <Bold>{checkBoxName}</Bold>
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
  }
}

// eslint-disable-next-line react/static-property-placement
SearchForm.defaultProps = {
  helplineInformation: null,
  helpline: null,
};

const mapStateToProps = (state, ownProps) => ({
  helpline: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid]?.helpline,
  counselors: state[namespace][configurationBase].counselors.list,
  helplineInformation: state[namespace][configurationBase].currentDefinitionVersion?.helplineInformation,
  previousContacts: state[namespace][searchContactsBase].tasks[ownProps.task.taskSid]?.previousContacts,
});

export default connect(mapStateToProps)(SearchForm);
