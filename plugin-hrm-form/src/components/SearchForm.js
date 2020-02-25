/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FieldText from './FieldText';
import FieldSelect from './FieldSelect';
import FieldDate from './FieldDate';
import { StyledButton } from '../Styles/HrmStyles';

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
  };

  state = {
    firstName: '',
    lastName: '',
    counselor: '',
    area: '',
    phoneNumber: '',
    dateFrom: '',
    dateTo: '',
    time: '',
  };

  render() {
    const { firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time } = this.state;

    return (
      <div>
        <FieldText
          id="Search_FirstName"
          label="First name"
          field={getField(firstName)}
          handleBlur={() => {}}
          handleChange={e => this.setState({ firstName: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldText
          id="Search_LastName"
          label="Last name"
          field={getField(lastName)}
          handleBlur={() => {}}
          handleChange={e => this.setState({ lastName: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldSelect
          field={getField(counselor)}
          id="Search_Counselor"
          name="counselor"
          label="Counselor"
          options={['', 'Counselor 1', 'Counselor 2', 'Counselor 3']}
          handleBlur={() => {}}
          handleChange={e => this.setState({ counselor: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldSelect
          field={getField(area)}
          id="Search_Area"
          name="area"
          label="Area"
          options={['', 'Area 1', 'Area 2', 'Area 3']}
          handleBlur={() => {}}
          handleChange={e => this.setState({ area: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldText
          id="Search_CustomerPhoneNumber"
          label="Customer phone number"
          field={getField(phoneNumber)}
          handleBlur={() => {}}
          handleChange={e => this.setState({ phoneNumber: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldDate
          id="Search_DateFrom"
          label="From"
          field={getField(dateFrom)}
          handleBlur={() => {}}
          handleChange={e => this.setState({ dateFrom: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldDate
          id="Search_DateTo"
          label="To"
          field={getField(dateTo)}
          handleBlur={() => {}}
          handleChange={e => this.setState({ dateTo: e.target.value })}
          handleFocus={() => {}}
        />
        <FieldSelect
          field={getField(time)}
          id="Search_Time"
          name="time"
          label="Time"
          options={['', 'Time 1', 'Time 2', 'Time 3']}
          handleBlur={() => {}}
          handleChange={e => this.setState({ time: e.target.value })}
          handleFocus={() => {}}
        />
        <StyledButton roundCorners={true} onClick={() => this.props.handleSearch(this.state)}>
          Search
        </StyledButton>
      </div>
    );
  }
}

export default SearchForm;
