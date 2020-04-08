/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import FieldDate from '../../FieldDate';
import { Container, StyledNextStepButton, Row, BottomButtonBar } from '../../../Styles/HrmStyles';
import { withConfiguration } from '../../../ConfigurationContext';
import { contextObject, searchFormType } from '../../../types';

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
    context: contextObject.isRequired,
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

    const { helpline } = this.props.context;
    const searchParams = {
      ...this.props.values,
      counselor: counselor.value, // backend expects only counselor's SID
      helpline,
    };

    const isTouched = firstName || lastName || (counselor && counselor.value) || phoneNumber || dateFrom || dateTo;

    return (
      <>
        <Container>
          <Row>
            <FieldText
              id="Search_FirstName"
              label="Name"
              placeholder="First"
              field={getField(firstName)}
              {...this.defaultEventHandlers('firstName')}
              style={{ marginRight: 25 }}
            />
            <FieldText
              id="Search_LastName"
              placeholder="Last"
              field={getField(lastName)}
              {...this.defaultEventHandlers('lastName')}
            />
          </Row>

          <Row>
            <FieldSelect
              id="Search_Counselor"
              name="counselor"
              label="Counselor"
              placeholder="Name"
              field={getField(counselor)}
              options={[{ label: '', value: '' }, ...counselorsOptions]}
              {...this.defaultEventHandlers('counselor')}
              style={{ marginRight: 25 }}
            />
            <FieldDate
              id="Search_DateFrom"
              label="Date range"
              placeholder="Start Date"
              field={getField(dateFrom)}
              {...this.defaultEventHandlers('dateFrom')}
              style={{ marginRight: '10px' }}
            />
            <FieldDate
              id="Search_DateTo"
              placeholder="End Date"
              field={getField(dateTo)}
              {...this.defaultEventHandlers('dateTo')}
              style={{ marginRight: '10px' }}
            />
          </Row>
          <Row>
            <FieldText
              id="Search_CustomerPhoneNumber"
              label="Customer phone"
              field={getField(phoneNumber)}
              {...this.defaultEventHandlers('phoneNumber')}
            />
          </Row>
        </Container>
        <BottomButtonBar>
          <StyledNextStepButton
            disabled={!isTouched}
            roundCorners={true}
            onClick={() => this.props.handleSearch(searchParams)}
          >
            Search
          </StyledNextStepButton>
        </BottomButtonBar>
      </>
    );
  }
}

export default withConfiguration(SearchForm);
