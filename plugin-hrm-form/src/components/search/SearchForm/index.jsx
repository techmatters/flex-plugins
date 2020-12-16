/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import FieldDate from '../../FieldDate';
import { Container, StyledNextStepButton, Row, BottomButtonBar } from '../../../styles/HrmStyles';
import { SearchTitle } from '../../../styles/search';
import { searchFormType } from '../../../types';
import { getConfig } from '../../../HrmFormPlugin';
import { namespace, configurationBase } from '../../../states';

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
    values: searchFormType.isRequired,
  };

  defaultEventHandlers = fieldName => ({
    handleChange: e => this.props.handleSearchFormChange(fieldName, e.target.value),
    handleBlur: () => {},
    handleFocus: () => {},
  });

  render() {
    const { firstName, lastName, counselor, phoneNumber, dateFrom, dateTo } = this.props.values;
    const counselorsOptions = this.props.counselors.map(e => ({ label: e.fullName, value: e.sid }));

    const { helpline, strings } = getConfig();
    const searchParams = {
      ...this.props.values,
      counselor: counselor.value, // backend expects only counselor's SID
      helpline,
      onlyDataContacts: false,
      closedCases: true,
    };

    const isTouched = firstName || lastName || (counselor && counselor.value) || phoneNumber || dateFrom || dateTo;

    const submitSearch = () => this.props.handleSearch(searchParams);
    const submitOnEnter = event => {
      if (event.key === 'Enter') submitSearch();
    };

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
              placeholder="First"
              field={getField(firstName)}
              {...this.defaultEventHandlers('firstName')}
              style={{ marginRight: 25 }}
              onKeyPress={submitOnEnter}
            />
            <FieldText
              id="Search_LastName"
              placeholder="Last"
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
              placeholder="Name"
              field={getField(counselor)}
              options={[{ label: '', value: '' }, ...counselorsOptions]}
              {...this.defaultEventHandlers('counselor')}
              style={{ marginRight: 25 }}
            />
            <FieldDate
              id="Search_DateFrom"
              label={strings['SearchForm-DateRange']}
              placeholder="Start Date"
              field={getField(dateFrom)}
              {...this.defaultEventHandlers('dateFrom')}
              style={{ marginRight: '10px' }}
            />
            <FieldDate
              id="Search_DateTo"
              label=" "
              placeholder="End Date"
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
            />
          </Row>
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

const mapStateToProps = state => ({
  counselors: state[namespace][configurationBase].counselors.list,
});

export default connect(mapStateToProps)(SearchForm);
