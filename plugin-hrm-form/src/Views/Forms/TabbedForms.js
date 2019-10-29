import React from 'react';
// import { Button } from '@material-ui/core';
import { withTaskContext } from "@twilio/flex-ui";
import { TabContainer } from '../../Styles/HrmStyles';
import {Tabs, Tab, Typography} from "@material-ui/core";


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
  };

  tabChange = (event, tab) => this.setState({tab});

  render() {
    return (
      <TabContainer>
        <Tabs
            value={this.state.tab}
            onChange={this.tabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
        >
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
        </Tabs>
      </TabContainer>
    );
  }
};

export default withTaskContext(TabbedForms);


//<h1>TabbedForms go here! Your selected type is: {props.form && props.form.callType ? props.form.callType : 'unknown!'}</h1>
