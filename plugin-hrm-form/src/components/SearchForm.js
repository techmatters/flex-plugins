/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@material-ui/icons/Search';
import { Manager } from '@twilio/flex-ui';
import { omit } from 'lodash';

import FieldText from './FieldText';
import FieldSelect from './FieldSelect';
import FieldDate from './FieldDate';
import { SearchFields, StyledSearchButton } from '../Styles/HrmStyles';
import { withConfiguration } from '../ConfigurationContext';

const currentWorkspace = Manager.getInstance().serviceConfiguration.taskrouter_workspace_sid;

const getField = value => ({
  value,
  error: null,
  validation: null,
  touched: false,
});

// TODO: should be added to the "urls exporting" module
const serverlessUrl = 'https://serverless-9971-dev.twil.io';

// TODO: should be migrated to our api/services file (module?)
/**
 * @param {string} workspaceSID The sid of the workspace
 * @returns {{sid: string, friendlyName: string}[]}
 */
const fetchCounselors = async workspaceSID => {
  const url = `${serverlessUrl}/populateCounselors?workspaceSID=${workspaceSID}`;

  const response = await fetch(url);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }

  return responseJson.prettyWorkers;
};

class SearchForm extends Component {
  static displayName = 'SearchForm';

  static propTypes = {
    helpline: PropTypes.func.isRequired,
    handleSearch: PropTypes.func.isRequired,
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
      const counselors = await fetchCounselors(currentWorkspace);

      this.setState({ counselors });
    } catch (err) {
      console.log(err.message);
    }
  }

  defaultEventHandlers = fieldName => ({
    handleChange: e => this.setState({ [fieldName]: e.target.value }),
    handleBlur: () => {},
    handleFocus: () => {},
  });

  render() {
    const { firstName, lastName, counselor, counselors, phoneNumber, dateFrom, dateTo } = this.state;
    const counselorsOptions = counselors.map(e => ({ label: e.friendlyName, value: e.sid }));

    const { helpline } = this.props;
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
