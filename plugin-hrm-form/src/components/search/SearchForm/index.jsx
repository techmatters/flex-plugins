/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@material-ui/icons/Search';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import FieldDate from '../../FieldDate';
import { Container, StyledSearchButton } from '../../../Styles/HrmStyles';
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

    return (
      <Container>
        <div style={{ display: 'flex' }}>
          <FieldText
            id="Search_FirstName"
            label="Child name"
            placeholder="First"
            field={getField(firstName)}
            {...this.defaultEventHandlers('firstName')}
            style={{ marginRight: 30 }}
          />
          <FieldText
            id="Search_LastName"
            placeholder="Last"
            field={getField(lastName)}
            {...this.defaultEventHandlers('lastName')}
          />
        </div>

        <div>
          <FieldSelect
            id="Search_Counselor"
            name="counselor"
            label="Counselor"
            field={getField(counselor)}
            options={[{ label: '', value: '' }, ...counselorsOptions]}
            {...this.defaultEventHandlers('counselor')}
          />
          <FieldDate
            id="Search_DateFrom"
            label="From"
            field={getField(dateFrom)}
            {...this.defaultEventHandlers('dateFrom')}
          />
          <FieldDate id="Search_DateTo" label="To" field={getField(dateTo)} {...this.defaultEventHandlers('dateTo')} />
        </div>
        <div>
          <FieldText
            id="Search_CustomerPhoneNumber"
            label="Customer phone"
            field={getField(phoneNumber)}
            {...this.defaultEventHandlers('phoneNumber')}
          />
        </div>
        <StyledSearchButton roundCorners={true} onClick={() => this.props.handleSearch(searchParams)}>
          <SearchIcon />
        </StyledSearchButton>
      </Container>
    );
  }
}

export default withConfiguration(SearchForm);
