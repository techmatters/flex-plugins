/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@material-ui/icons/Search';
import { omit } from 'lodash';

import FieldText from '../FieldText';
import FieldSelect from '../FieldSelect';
import FieldDate from '../FieldDate';
import { SearchFields, StyledSearchButton } from '../../Styles/HrmStyles';
import { withConfiguration } from '../../ConfigurationContext';
import { contextObject } from '../../types';
import { populateCounselors } from '../../services/ServerlessService';

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
    context: contextObject.isRequired,
  };

  state = {
    firstName: '',
    lastName: '',
    counselor: { label: '', value: '' },
    counselors: [],
    phoneNumber: '',
    dateFrom: '',
    dateTo: '',
  };

  async componentDidMount() {
    try {
      const { context } = this.props;
      const counselors = await populateCounselors(context);

      this.setState({ counselors });
    } catch (err) {
      // TODO (Gian): probably we need to handle this in a nicer way
      console.error(err.message);
    }
  }

  defaultEventHandlers = fieldName => ({
    handleChange: e => this.setState({ [fieldName]: e.target.value }),
    handleBlur: () => {},
    handleFocus: () => {},
  });

  render() {
    const { firstName, lastName, counselor, counselors, phoneNumber, dateFrom, dateTo } = this.state;
    const counselorsOptions = counselors.map(e => ({ label: e.fullName, value: e.sid }));

    const { helpline } = this.props.context;
    const searchParams = {
      ...omit(this.state, 'counselors'),
      counselor: counselor.value, // backend expects only counselor's SID
      helpline,
    };

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
          options={[{ label: '', value: '' }, ...counselorsOptions]}
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
