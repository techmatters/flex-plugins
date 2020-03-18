/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@material-ui/icons/Search';

import FieldText from './FieldText';
import FieldSelect from './FieldSelect';
import FieldDate from './FieldDate';
import { SearchFields, StyledSearchButton } from '../Styles/HrmStyles';
import { withConfiguration } from '../ConfigurationContext';

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

class SearchForm extends Component {
  static displayName = 'SearchForm';

  static propTypes = {
    helpline: PropTypes.func.isRequired,
    handleSearch: PropTypes.func.isRequired,
  };

  state = {
    firstName: '',
    lastName: '',
    counselor: '',
    phoneNumber: '',
    dateFrom: '',
    dateTo: '',
  };

  defaultEventHandlers = fieldName => ({
    handleChange: e => this.setState({ [fieldName]: e.target.value }),
    handleBlur: () => {},
    handleFocus: () => {},
  });

  render() {
    const { firstName, lastName, counselor, phoneNumber, dateFrom, dateTo } = this.state;
    const { helpline } = this.props;
    const searchParams = { ...this.state, helpline };

    return (
      <SearchFields>
        <FieldText
          id="Search_FirstName"
          label="First name"
          field={getField(firstName)}
          {...this.defaultEventHandlers('firstName')}
        />
        <FieldText
          id="Search_LastName"
          label="Last name"
          field={getField(lastName)}
          {...this.defaultEventHandlers('lastName')}
        />
        <FieldSelect
          id="Search_Counselor"
          name="counselor"
          label="Counselor"
          field={getField(counselor)}
          options={['', 'Counselor 1', 'Counselor 2', 'Counselor 3']}
          {...this.defaultEventHandlers('counselor')}
        />
        <FieldText
          id="Search_CustomerPhoneNumber"
          label="Customer phone"
          field={getField(phoneNumber)}
          {...this.defaultEventHandlers('phoneNumber')}
        />
        <FieldDate
          id="Search_DateFrom"
          label="From"
          field={getField(dateFrom)}
          {...this.defaultEventHandlers('dateFrom')}
        />
        <FieldDate id="Search_DateTo" label="To" field={getField(dateTo)} {...this.defaultEventHandlers('dateTo')} />
        <StyledSearchButton roundCorners={true} onClick={() => this.props.handleSearch(searchParams)}>
          <SearchIcon />
        </StyledSearchButton>
      </SearchFields>
    );
  }
}

export default withConfiguration(SearchForm);
