import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import { CheckboxField,
         Container, 
         Header2,
         StyledCheckboxLabel,
         StyledInput,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TextField,
         TransparentButton
        } from '../../Styles/HrmStyles';
import { Checkbox,
         Tab, 
         Tabs} from "@material-ui/core";
import { callTypes } from '../../states/DomainConstants'


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
  };

  tabChange = (event, tab) => this.setState({tab});

  render() {
    const taskId = this.props.task.taskSid;

    let body = new Array(3);
    body[0] = (
      <Container>
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

        <Header2>
          Location
        </Header2>
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
      </Container>
    );
    body[1] = (
      <Container>
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

        <Header2>
          School
        </Header2>
        <TextField>
            <StyledLabel>Name</StyledLabel>
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
            <StyledLabel>City</StyledLabel>
            <StyledInput theme={this.props.theme} 
              name='gradeLevel'
              value={this.props.form.childInformation.school.gradeLevel}
              onChange={(e) => 
                this.props.handleChange(taskId,
                                        ['childInformation', 'school'],
                                        e)}
            />
        </TextField>

        <Header2>
          Location
        </Header2>
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
      </Container>
    );

    body[2] = (
      <Container>
        <BranchingFormIssueCategory category="1" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        <BranchingFormIssueCategory category="2" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        <BranchingFormIssueCategory category="3" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        <BranchingFormIssueCategory category="4" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        <BranchingFormIssueCategory category="5" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
        <BranchingFormIssueCategory category="6" handleCheckbox={this.props.handleCheckbox} taskId={taskId} form={this.props.form}/>
      </Container>
    );

    body[3] = (
      <Container>
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
      </Container>
    );

    let tabs = [
      <Tab label="Caller Information" />,
      <Tab label="Child Information" />,
      <Tab label="Issue Categorization" />,
      <Tab label="Case Information" />
    ];

    // TODO(nick): this is probably not the best way to hide the caller info tab
    if (this.props.form.callType !== callTypes.caller) {
      tabs.shift();
      body.shift();
    }

    return (
      <>
        <TransparentButton onClick={(e) => this.props.handleCallTypeButtonClick(taskId, '')}>&lt; BACK</TransparentButton>
        <Tabs
            value={this.state.tab}
            onChange={this.tabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
        >
          {tabs}
        </Tabs>
        {body[this.state.tab]}
      </>
    );
  }
};

function BranchingFormIssueCategory(props) {
  const cat = props.category;
  return (
    <>
      <StyledLabel>Category {cat}</StyledLabel>
      {Array.from(Array(6), (e, i) => {
        const index = i + 1;
        return (
          <CheckboxField>
            <Checkbox
              checked={props.form.caseInformation.categories['category' + cat]['Sub' + index]} 
              onClick={(e) => props.handleCheckbox(props.taskId,
                                                   ['caseInformation', 'categories', 'category' + cat],
                                                   'sub' + index, 
                                                   !props.form.caseInformation.categories['category' + cat]['sub' + index])}
            />
            <StyledCheckboxLabel>Sub{index}</StyledCheckboxLabel>
          </CheckboxField>
        );
      })}
    </>
  );
}

export default withTaskContext(TabbedForms);
