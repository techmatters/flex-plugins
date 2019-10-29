import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import { Container, 
         Header3,
         StyledInput,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TabContainer, 
         TextField
        } from '../../Styles/HrmStyles';
import {Tabs, Tab, Typography} from "@material-ui/core";


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
  };

  tabChange = (event, tab) => this.setState({tab});

  render() {
    const taskId = this.props.task.taskSid;

    let body = new Array(3);
    body[0] = (
      <Typography component="div">
        <TextField>
            <StyledLabel>First name</StyledLabel>
            <StyledInput theme={this.props.theme} 
              name='firstName'
              value={this.props.form.callerInformation.name.firstName}
              onChange={(e) => 
                this.props.handleChange(taskId,
                                        ['callerInformation', 'name'],
                                        e)}
            />
        </TextField>

        <TextField>
            <StyledLabel>Last name</StyledLabel>
            <StyledInput theme={this.props.theme} 
              value={this.props.form.callerInformation.name.lastName}
              name='lastName'
              onChange={(e) => 
                this.props.handleChange(taskId,
                                        ['callerInformation', 'name'],
                                        e)}
            />
        </TextField>

        <TextField>
            <StyledLabel>Relationship to Child</StyledLabel>
            <StyledSelect 
              name="relationshipToChild"
              value={this.props.form.callerInformation.relationshipToChild}
              onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
              <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
              <StyledMenuItem value="Friend">Friend</StyledMenuItem>
              <StyledMenuItem value="Neighbor">Neighbor</StyledMenuItem>
              <StyledMenuItem value="Parent">Parent</StyledMenuItem>
              <StyledMenuItem value="Grandparent">Grandparent</StyledMenuItem>
              <StyledMenuItem value="Teacher">Teacher</StyledMenuItem>
              <StyledMenuItem value="Other">Other</StyledMenuItem>
            </StyledSelect>
        </TextField>

        <TextField>
            <StyledLabel>text entry label1</StyledLabel>
            <StyledInput multiline={true} rows={10} theme={this.props.theme} />
        </TextField>


      </Typography>
    );
    body[1] = (
      <Typography component="div">
      <Header3>
        Child Information
      </Header3>
    </Typography>
    );
    body[2] = (
      <Typography component="div">
      <Header3>
        Summary
      </Header3>
    </Typography>
    );
    return (
      <Container>
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
        {body[this.state.tab]}
      </Container>
    );
  }
};

export default withTaskContext(TabbedForms);


//<h1>TabbedForms go here! Your selected type is: {props.form && props.form.callType ? props.form.callType : 'unknown!'}</h1>
