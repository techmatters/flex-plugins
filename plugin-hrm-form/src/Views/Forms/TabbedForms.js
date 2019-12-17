import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import { BottomButtonBar,
         CategoryCheckboxField,
         CheckboxField,
         ColumnarBlock,
         Container,
         NameFields,
         StyledCheckboxLabel,
         StyledInput,
         StyledLabel,
         StyledMenuItem,
         StyledNextStepButton,
         StyledSelect,
         TextField,
         TopNav,
         TwoColumnLayout,
         TransparentButton
        } from '../../Styles/HrmStyles';
import { Checkbox,
         Tab, 
         Tabs} from "@material-ui/core";
import { callTypes } from '../../states/DomainConstants'


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
    reportingcountry: ''
  };

  tabChange = (event, tab) => this.setState({tab});
  reportingcountryChange = (event) => this.setState({reportingcountry: event.target.value});

  reporters = {
    "United Kingdom" : {
      name: "IWF UK",
      site: "https://report.iwf.org.uk/en/report"
    },
    "United States" : {
      name: "NCMEC",
      site: "https://report.cybertip.org/"
    }
  }

  render() {
    const taskId = this.props.task.taskSid;

    let body = new Array(5);

    // Caller Information
    body[0] = (
      <Container>
        <NameFields>
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
        </NameFields>

        <TwoColumnLayout>
          <ColumnarBlock>
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
                <StyledLabel>Gender</StyledLabel>
                <StyledSelect 
                  name="gender"
                  value={this.props.form.callerInformation.gender}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Male">Male</StyledMenuItem>
                  <StyledMenuItem value="Female">Female</StyledMenuItem>
                  <StyledMenuItem value="Other">Other</StyledMenuItem>
                  <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Age</StyledLabel>
                <StyledSelect 
                  name="age"
                  value={this.props.form.callerInformation.age}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="0-3">0-3</StyledMenuItem>
                  <StyledMenuItem value="4-6">4-6</StyledMenuItem>
                  <StyledMenuItem value="7-9">7-9</StyledMenuItem>
                  <StyledMenuItem value="10-12">10-12</StyledMenuItem>
                  <StyledMenuItem value="13-15">13-15</StyledMenuItem>
                  <StyledMenuItem value="16-17">16-17</StyledMenuItem>
                  <StyledMenuItem value="18-25">18-25</StyledMenuItem>
                  <StyledMenuItem value=">25">&gt;25</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Language</StyledLabel>
                <StyledSelect 
                  name="language"
                  value={this.props.form.callerInformation.language}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Language 1">Language 1</StyledMenuItem>
                  <StyledMenuItem value="Language 2">Language 2</StyledMenuItem>
                  <StyledMenuItem value="Language 3">Language 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Nationality</StyledLabel>
                <StyledSelect 
                  name="nationality"
                  value={this.props.form.callerInformation.nationality}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Nationality 1">Nationality 1</StyledMenuItem>
                  <StyledMenuItem value="Nationality 2">Nationality 2</StyledMenuItem>
                  <StyledMenuItem value="Nationality 3">Nationality 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Ethnicity</StyledLabel>
                <StyledSelect 
                  name="ethnicity"
                  value={this.props.form.callerInformation.ethnicity}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 1">Ethnicity 1</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 2">Ethnicity 2</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 3">Ethnicity 3</StyledMenuItem>
                </StyledSelect>
            </TextField>
          </ColumnarBlock>

          <ColumnarBlock>
            <TextField>
                <StyledLabel>Street Address</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='streetAddress'
                  value={this.props.form.callerInformation.location.streetAddress}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>City</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='city'
                  value={this.props.form.callerInformation.location.city}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>State/County</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='stateOrCounty'
                  value={this.props.form.callerInformation.location.stateOrCounty}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Postal Code</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='postalCode'
                  value={this.props.form.callerInformation.location.postalCode}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Phone #1</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='phone1'
                  value={this.props.form.callerInformation.location.phone1}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Phone #2</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='phone2'
                  value={this.props.form.callerInformation.location.phone2}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>
          </ColumnarBlock>
        </TwoColumnLayout>
      </Container>
    );

    // Child Information
    body[1] = (
      <Container>
        <NameFields>
          <TextField>
              <StyledLabel>First name</StyledLabel>
              <StyledInput theme={this.props.theme} 
                name='firstName'
                value={this.props.form.childInformation.name.firstName}
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'name'],
                                          e)}
              />
          </TextField>

          <TextField>
              <StyledLabel>Last name</StyledLabel>
              <StyledInput theme={this.props.theme} 
                value={this.props.form.childInformation.name.lastName}
                name='lastName'
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'name'],
                                          e)}
              />
          </TextField>
        </NameFields>

        <TwoColumnLayout>
          <ColumnarBlock>
            <TextField>
                <StyledLabel>Gender</StyledLabel>
                <StyledSelect 
                  name="gender"
                  value={this.props.form.childInformation.gender}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Male">Male</StyledMenuItem>
                  <StyledMenuItem value="Female">Female</StyledMenuItem>
                  <StyledMenuItem value="Other">Other</StyledMenuItem>
                  <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Age</StyledLabel>
                <StyledSelect 
                  name="age"
                  value={this.props.form.childInformation.age}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="0-3">0-3</StyledMenuItem>
                  <StyledMenuItem value="4-6">4-6</StyledMenuItem>
                  <StyledMenuItem value="7-9">7-9</StyledMenuItem>
                  <StyledMenuItem value="10-12">10-12</StyledMenuItem>
                  <StyledMenuItem value="13-15">13-15</StyledMenuItem>
                  <StyledMenuItem value="16-17">16-17</StyledMenuItem>
                  <StyledMenuItem value="18-25">18-25</StyledMenuItem>
                  <StyledMenuItem value=">25">&gt;25</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Language</StyledLabel>
                <StyledSelect 
                  name="language"
                  value={this.props.form.childInformation.language}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Language 1">Language 1</StyledMenuItem>
                  <StyledMenuItem value="Language 2">Language 2</StyledMenuItem>
                  <StyledMenuItem value="Language 3">Language 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Nationality</StyledLabel>
                <StyledSelect 
                  name="nationality"
                  value={this.props.form.childInformation.nationality}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Nationality 1">Nationality 1</StyledMenuItem>
                  <StyledMenuItem value="Nationality 2">Nationality 2</StyledMenuItem>
                  <StyledMenuItem value="Nationality 3">Nationality 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Ethnicity</StyledLabel>
                <StyledSelect 
                  name="ethnicity"
                  value={this.props.form.childInformation.ethnicity}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 1">Ethnicity 1</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 2">Ethnicity 2</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 3">Ethnicity 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <CheckboxField>
              <Checkbox name='refugee' 
                  checked={this.props.form.childInformation.refugee} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'refugee', 
                                            !this.props.form.childInformation.refugee)}
              />
              <StyledCheckboxLabel>Refugee?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='disabledOrSpecialNeeds' 
                  checked={this.props.form.childInformation.disabledOrSpecialNeeds} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'disabledOrSpecialNeeds', 
                                            !this.props.form.childInformation.disabledOrSpecialNeeds)}
              />
              <StyledCheckboxLabel>Disabled/Special Needs?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='hiv' 
                  checked={this.props.form.childInformation.hiv} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'hiv', 
                                            !this.props.form.childInformation.hiv)}
              />
              <StyledCheckboxLabel>HIV Positive?</StyledCheckboxLabel>
            </CheckboxField>
          </ColumnarBlock>

          <ColumnarBlock>
            <TextField>
                <StyledLabel>Street Address</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='streetAddress'
                  value={this.props.form.childInformation.location.streetAddress}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>City</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='city'
                  value={this.props.form.childInformation.location.city}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>State/County</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='stateOrCounty'
                  value={this.props.form.childInformation.location.stateOrCounty}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Postal Code</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='postalCode'
                  value={this.props.form.childInformation.location.postalCode}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Phone #1</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='phone1'
                  value={this.props.form.childInformation.location.phone1}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
              <StyledLabel>Phone #2</StyledLabel>
              <StyledInput theme={this.props.theme} 
                name='phone2'
                value={this.props.form.childInformation.location.phone2}
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'location'],
                                          e)}
              />
            </TextField>

            <TextField>
                <StyledLabel>School Name</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='name'
                  value={this.props.form.childInformation.school.name}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'school'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel>Grade Level</StyledLabel>
                <StyledInput theme={this.props.theme} 
                  name='gradeLevel'
                  value={this.props.form.childInformation.school.gradeLevel}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'school'],
                                            e)}
                />
            </TextField>
          </ColumnarBlock>
        </TwoColumnLayout>
      </Container>
    );

    // Issue Categorization
    body[2] = (
      <Container style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px'}}>
          <BranchingFormIssueCategory category="1" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="2" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="3" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <BranchingFormIssueCategory category="4" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="5" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="6" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        </div>
      </Container>
    );

    // Case Information
    body[3] = (
      <Container>
        <TwoColumnLayout>
          <ColumnarBlock>
            <TextField>
              <StyledLabel>Call summary</StyledLabel>
              <StyledInput multiline={true} rows={10} theme={this.props.theme} style={{width: "100%"}}
                name="callSummary"
                value={this.props.form.caseInformation.callSummary}
                onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}
              />
            </TextField>

            <TextField>
                <StyledLabel>Referred To</StyledLabel>
                <StyledSelect 
                  name="referredTo"
                  value={this.props.form.caseInformation.referredTo}
                  onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="No Referral">No Referral</StyledMenuItem>
                  <StyledMenuItem value="Referral 1">Referral 1</StyledMenuItem>
                  <StyledMenuItem value="Referral 2">Referral 2</StyledMenuItem>
                  <StyledMenuItem value="Referral 3">Referral 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel>Status</StyledLabel>
                <StyledSelect 
                  name="status"
                  value={this.props.form.caseInformation.status}
                  onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Open">Open</StyledMenuItem>
                  <StyledMenuItem value="In Progress">In Progress</StyledMenuItem>
                  <StyledMenuItem value="Closed">Closed</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
              <StyledLabel>How did the child hear about us?</StyledLabel>
              <StyledSelect 
                name="howDidTheChildHearAboutUs"
                value={this.props.form.caseInformation.howDidTheChildHearAboutUs}
                onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}>
                <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                <StyledMenuItem value="Word of Mouth">Word of Mouth</StyledMenuItem>
                <StyledMenuItem value="Media">Media</StyledMenuItem>
                <StyledMenuItem value="Friend">Friend</StyledMenuItem>
                <StyledMenuItem value="School">School</StyledMenuItem>
              </StyledSelect>
            </TextField>
          </ColumnarBlock>

          <ColumnarBlock>
            <CheckboxField>
                <Checkbox name='keepConfidential' 
                    checked={this.props.form.caseInformation.keepConfidential} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'keepConfidential', 
                                              !this.props.form.caseInformation.keepConfidential)}
                />
                <StyledCheckboxLabel>Keep Confidential?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
                <Checkbox name='okForCaseWorkerToCall' 
                    checked={this.props.form.caseInformation.okForCaseWorkerToCall} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'okForCaseWorkerToCall', 
                                              !this.props.form.caseInformation.okForCaseWorkerToCall)}
                />
                <StyledCheckboxLabel>OK for case worker to call?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
                <Checkbox name='didYouDiscussRightsWithTheChild' 
                    checked={this.props.form.caseInformation.didYouDiscussRightsWithTheChild} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'didYouDiscussRightsWithTheChild', 
                                              !this.props.form.caseInformation.didYouDiscussRightsWithTheChild)}
                />
                <StyledCheckboxLabel>Did you discuss rights with the child?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='didTheChildFeelWeSolvedTheirProblem' 
                  checked={this.props.form.caseInformation.didTheChildFeelWeSolvedTheirProblem} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['caseInformation'],
                                            'didTheChildFeelWeSolvedTheirProblem', 
                                            !this.props.form.caseInformation.didTheChildFeelWeSolvedTheirProblem)}
              />
              <StyledCheckboxLabel>Did the child feel we solved their problem?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='wouldTheChildRecommendUsToAFriend' 
                  checked={this.props.form.caseInformation.wouldTheChildRecommendUsToAFriend} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['caseInformation'],
                                            'wouldTheChildRecommendUsToAFriend', 
                                            !this.props.form.caseInformation.wouldTheChildRecommendUsToAFriend)}
              />
              <StyledCheckboxLabel>Would the child recommend us to a friend?</StyledCheckboxLabel>
            </CheckboxField>
          </ColumnarBlock>
        </TwoColumnLayout>
      </Container>
    );

    body[4] = (
      <Container>
        <p>Which country are you reporting to?</p>
        <StyledSelect 
          name="reportingcountry"
          value={this.state.reportingcountry}
          onChange={(e) => this.reportingcountryChange(e)}>
          <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
          <StyledMenuItem value="United Kingdom">United Kingdom</StyledMenuItem>
          <StyledMenuItem value="United States">United States</StyledMenuItem>
        </StyledSelect>
        <p></p>
        {this.state.reportingcountry ? 
          <a href={this.reporters[this.state.reportingcountry]['site']} target="_blank">
            <StyledNextStepButton 
              roundCorners={true}
              theme={this.props.theme} 
              style={{marginTop: '10px'}}
            >
              Open {this.reporters[this.state.reportingcountry]['name']}
            </StyledNextStepButton>
          </a> : ''
        }
      </Container>
    );

    let tabs = [
      <Tab label="Caller Information" />,
      <Tab label="Child Information" />,
      <Tab label="Issue Categorization" />,
      <Tab label="Case Information" />,
      <Tab label="CSAM Report" />
    ];

    // TODO(nick): this is probably not the best way to hide the caller info tab
    if (this.props.form.callType !== callTypes.caller) {
      tabs.shift();
      body.shift();
    }

    return (
      <>
        <TopNav>
          <TransparentButton onClick={(e) => this.props.handleCallTypeButtonClick(taskId, '')}>&lt; BACK</TransparentButton>
        </TopNav>
        <Tabs
            name="tab"
            value={this.state.tab}
            onChange={this.tabChange}
            centered
        >
          {tabs}
        </Tabs>
        {body[this.state.tab]}
        <BottomButtonBar>
          {this.state.tab < body.length - 2 ?
            <StyledNextStepButton 
              roundCorners={true}
              theme={this.props.theme} 
              onClick={(e) => this.setState({ tab: this.state.tab + 1})}
            >
              Next
            </StyledNextStepButton> :
            this.state.tab < body.length - 1 ?
              <StyledNextStepButton
                roundCorners={true}
                theme={this.props.theme}
                onClick={(e) => this.props.handleCompleteTask(this.props.task.taskSid, this.props.task)}
              >
                Submit
              </StyledNextStepButton> : ''
            }
        </BottomButtonBar>
      </>
    );
  }
};

function BranchingFormIssueCategory(props) {
  const cat = props.category;
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <StyledLabel>Category {cat}</StyledLabel>
      {Array.from(Array(6), (e, i) => {
        const index = i + 1;
        return (
          <CategoryCheckboxField>
            {/* TODO(nick): the inline style below is ugly */}
            <Checkbox 
              style={{ width: 30, height: 30, boxSizing: 'border-box' }}
              checked={props.form.caseInformation.categories['category' + cat]['sub' + index]} 
              onClick={(e) => props.handleCheckbox(props.taskId,
                                                   ['caseInformation', 'categories', 'category' + cat],
                                                   'sub' + index, 
                                                   !props.form.caseInformation.categories['category' + cat]['sub' + index])}
            />
            <StyledCheckboxLabel>Subcategory {index}</StyledCheckboxLabel>
          </CategoryCheckboxField>
        );
      })}
    </div>
  );
}

export default withTaskContext(TabbedForms);
