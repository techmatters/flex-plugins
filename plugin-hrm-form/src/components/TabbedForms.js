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
        } from '../Styles/HrmStyles';
import { Checkbox,
         Tab, 
         Tabs} from "@material-ui/core";
import { callTypes } from '../states/DomainConstants'
import FieldFirstName from './FieldFirstName';
import FieldGender from './FieldGender';
import decorateTab from './decorateTab';
import { formIsValid } from '../states/ValidationRules';


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
  };

  tabChange = (event, tab) => this.setState({tab});

  render() {
    const taskId = this.props.task.taskSid;

    let body = new Array(3);

    // Caller Information
    body[0] = (
      <Container>
        <NameFields>
          <FieldFirstName
            form={this.props.form}
            handleBlur={this.props.handleBlur}
            handleChange={this.props.handleChange}
            handleFocus={this.props.handleFocus}
            taskId={taskId}
          />

          <TextField>
              <StyledLabel htmlFor="CallerInformation_LastName">Last name</StyledLabel>
              <StyledInput
                value={this.props.form.callerInformation.name.lastName.value}
                name='lastName'
                id="CallerInformation_LastName"
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
                <StyledLabel htmlFor="CallerInformation_RelationshipToChild">Relationship to Child</StyledLabel>
                <StyledSelect 
                  name="relationshipToChild"
                  id="CallerInformation_RelationshipToChild"
                  value={this.props.form.callerInformation.relationshipToChild.value}
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
                <StyledLabel htmlFor="CallerInformation_Gender">Gender</StyledLabel>
                <StyledSelect 
                  name="gender"
                  id="CallerInformation_Gender"
                  value={this.props.form.callerInformation.gender.value}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Male">Male</StyledMenuItem>
                  <StyledMenuItem value="Female">Female</StyledMenuItem>
                  <StyledMenuItem value="Other">Other</StyledMenuItem>
                  <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_Age">Age</StyledLabel>
                <StyledSelect 
                  name="age"
                  id="CallerInformation_Age"
                  value={this.props.form.callerInformation.age.value}
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
                <StyledLabel htmlFor="CallerInformation_Language">Language</StyledLabel>
                <StyledSelect 
                  name="language"
                  id="CallerInformation_Language"
                  value={this.props.form.callerInformation.language.value}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Language 1">Language 1</StyledMenuItem>
                  <StyledMenuItem value="Language 2">Language 2</StyledMenuItem>
                  <StyledMenuItem value="Language 3">Language 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_Nationality">Nationality</StyledLabel>
                <StyledSelect 
                  name="nationality"
                  id="CallerInformation_Nationality"
                  value={this.props.form.callerInformation.nationality.value}
                  onChange={(e) => this.props.handleChange(taskId, ['callerInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Nationality 1">Nationality 1</StyledMenuItem>
                  <StyledMenuItem value="Nationality 2">Nationality 2</StyledMenuItem>
                  <StyledMenuItem value="Nationality 3">Nationality 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_Ethnicity">Ethnicity</StyledLabel>
                <StyledSelect 
                  name="ethnicity"
                  id="CallerInformation_Ethnicity"
                  value={this.props.form.callerInformation.ethnicity.value}
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
                <StyledLabel htmlFor="CallerInformation_StreetAddress">Street Address</StyledLabel>
                <StyledInput
                  name='streetAddress'
                  id="CallerInformation_StreetAddress"
                  value={this.props.form.callerInformation.location.streetAddress.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_City">City</StyledLabel>
                <StyledInput
                  name='city'
                  id="CallerInformation_City"
                  value={this.props.form.callerInformation.location.city.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_StateOrCounty">State/County</StyledLabel>
                <StyledInput
                  name='stateOrCounty'
                  id="CallerInformation_StateOrCounty"
                  value={this.props.form.callerInformation.location.stateOrCounty.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_PostalCode">Postal Code</StyledLabel>
                <StyledInput
                  name='postalCode'
                  id="CallerInformation_PostalCode"
                  value={this.props.form.callerInformation.location.postalCode.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_Phone1">Phone #1</StyledLabel>
                <StyledInput
                  name='phone1'
                  id="CallerInformation_Phone1"
                  value={this.props.form.callerInformation.location.phone1.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['callerInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CallerInformation_Phone2">Phone #2</StyledLabel>
                <StyledInput
                  name='phone2'
                  id="CallerInformation_Phone2"
                  value={this.props.form.callerInformation.location.phone2.value}
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
              <StyledLabel htmlFor="ChildInformation_FirstName">First name</StyledLabel>
              <StyledInput
                name='firstName'
                id="ChildInformation_FirstName"
                value={this.props.form.childInformation.name.firstName.value}
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'name'],
                                          e)}
              />
          </TextField>

          <TextField>
              <StyledLabel htmlFor="ChildInformation_LastName">Last name</StyledLabel>
              <StyledInput
                value={this.props.form.childInformation.name.lastName.value}
                name='lastName'
                id="ChildInformation_LastName"
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'name'],
                                          e)}
              />
          </TextField>
        </NameFields>

        <TwoColumnLayout>
          <ColumnarBlock>
            { /* <TextField>
                <StyledLabel htmlFor="ChildInformation_Gender">Gender</StyledLabel>
                <StyledSelect 
                  name="gender"
                  id="ChildInformation_Gender"
                  value={this.props.form.childInformation.gender}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Male">Male</StyledMenuItem>
                  <StyledMenuItem value="Female">Female</StyledMenuItem>
                  <StyledMenuItem value="Other">Other</StyledMenuItem>
                  <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
                </StyledSelect>
            </TextField> */ }

            <FieldGender
              form={this.props.form}
              handleBlur={this.props.handleBlur}
              handleChange={this.props.handleChange}
              handleFocus={this.props.handleFocus}
              taskId={taskId}
            />

            <TextField>
                <StyledLabel htmlFor="ChildInformation_Age">Age</StyledLabel>
                <StyledSelect 
                  name="age"
                  id="ChildInformation_Age"
                  value={this.props.form.childInformation.age.value}
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
                <StyledLabel htmlFor="ChildInformation_Language">Language</StyledLabel>
                <StyledSelect 
                  name="language"
                  id="ChildInformation_Language"
                  value={this.props.form.childInformation.language.value}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Language 1">Language 1</StyledMenuItem>
                  <StyledMenuItem value="Language 2">Language 2</StyledMenuItem>
                  <StyledMenuItem value="Language 3">Language 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_Nationality">Nationality</StyledLabel>
                <StyledSelect 
                  name="nationality"
                  id="ChildInformation_Nationality"
                  value={this.props.form.childInformation.nationality.value}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Nationality 1">Nationality 1</StyledMenuItem>
                  <StyledMenuItem value="Nationality 2">Nationality 2</StyledMenuItem>
                  <StyledMenuItem value="Nationality 3">Nationality 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_Ethnicity">Ethnicity</StyledLabel>
                <StyledSelect 
                  name="ethnicity"
                  id="ChildInformation_Ethnicity"
                  value={this.props.form.childInformation.ethnicity.value}
                  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 1">Ethnicity 1</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 2">Ethnicity 2</StyledMenuItem>
                  <StyledMenuItem value="Ethnicity 3">Ethnicity 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <CheckboxField>
              <Checkbox name='refugee' 
                  id="ChildInformation_Refugee"
                  checked={this.props.form.childInformation.refugee.value} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'refugee', 
                                            !this.props.form.childInformation.refugee.value)}
              />
              <StyledCheckboxLabel htmlFor="ChildInformation_Refugee">Refugee?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='disabledOrSpecialNeeds' 
                  id="ChildInformation_DisabledOrSpecialNeeds"
                  checked={this.props.form.childInformation.disabledOrSpecialNeeds.value} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'disabledOrSpecialNeeds', 
                                            !this.props.form.childInformation.disabledOrSpecialNeeds.value)}
              />
              <StyledCheckboxLabel htmlFor="ChildInformation_DisabledOrSpecialNeeds">Disabled/Special Needs?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='hiv' 
                  id="ChildInformation_HIV"
                  checked={this.props.form.childInformation.hiv.value} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['childInformation'],
                                            'hiv', 
                                            !this.props.form.childInformation.hiv.value)}
              />
              <StyledCheckboxLabel htmlFor="ChildInformation_HIV">HIV Positive?</StyledCheckboxLabel>
            </CheckboxField>
          </ColumnarBlock>

          <ColumnarBlock>
            <TextField>
                <StyledLabel htmlFor="ChildInformation_StreetAddress">Street Address</StyledLabel>
                <StyledInput
                  name='streetAddress'
                  id="ChildInformation_StreetAddress"
                  value={this.props.form.childInformation.location.streetAddress.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_City">City</StyledLabel>
                <StyledInput
                  name='city'
                  id="ChildInformation_City"
                  value={this.props.form.childInformation.location.city.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_StateOrCounty">State/County</StyledLabel>
                <StyledInput
                  name='stateOrCounty'
                  id="ChildInformation_StateOrCounty"
                  value={this.props.form.childInformation.location.stateOrCounty.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_PostalCode">Postal Code</StyledLabel>
                <StyledInput
                  name='postalCode'
                  id="ChildInformation_PostalCode"
                  value={this.props.form.childInformation.location.postalCode.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_Phone1">Phone #1</StyledLabel>
                <StyledInput
                  name='phone1'
                  id="ChildInformation_Phone1"
                  value={this.props.form.childInformation.location.phone1.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'location'],
                                            e)}
                />
            </TextField>

            <TextField>
              <StyledLabel htmlFor="ChildInformation_Phone2">Phone #2</StyledLabel>
              <StyledInput
                name='phone2'
                id="ChildInformation_Phone2"
                value={this.props.form.childInformation.location.phone2.value}
                onChange={(e) => 
                  this.props.handleChange(taskId,
                                          ['childInformation', 'location'],
                                          e)}
              />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_SchoolName">School Name</StyledLabel>
                <StyledInput
                  name='name'
                  id="ChildInformation_SchoolName"
                  value={this.props.form.childInformation.school.name.value}
                  onChange={(e) => 
                    this.props.handleChange(taskId,
                                            ['childInformation', 'school'],
                                            e)}
                />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="ChildInformation_GradeLevel">Grade Level</StyledLabel>
                <StyledInput
                  name='gradeLevel'
                  id="ChildInformation_GradeLevel"
                  value={this.props.form.childInformation.school.gradeLevel.value}
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
          <BranchingFormIssueCategory category="1" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="2" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="3" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <BranchingFormIssueCategory category="4" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="5" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
          <BranchingFormIssueCategory category="6" handleCategoryToggle={this.props.handleCategoryToggle} taskId={taskId} form={this.props.form}/>
        </div>
      </Container>
    );

    // Case Information
    body[3] = (
      <Container>
        <TwoColumnLayout>
          <ColumnarBlock>
            <TextField>
              <StyledLabel htmlFor="CaseInformation_CallSummary">Call summary</StyledLabel>
              <StyledInput multiline={true} rows={10} style={{width: "100%"}}
                name="callSummary"
                id="CaseInformation_CallSummary"
                value={this.props.form.caseInformation.callSummary.value}
                onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}
              />
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CaseInformation_ReferredTo">Referred To</StyledLabel>
                <StyledSelect 
                  name="referredTo"
                  id="CaseInformation_ReferredTo"
                  value={this.props.form.caseInformation.referredTo.value}
                  onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="No Referral">No Referral</StyledMenuItem>
                  <StyledMenuItem value="Referral 1">Referral 1</StyledMenuItem>
                  <StyledMenuItem value="Referral 2">Referral 2</StyledMenuItem>
                  <StyledMenuItem value="Referral 3">Referral 3</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
                <StyledLabel htmlFor="CaseInformation_Status">Status</StyledLabel>
                <StyledSelect 
                  name="status"
                  id="CaseInformation_Status"
                  value={this.props.form.caseInformation.status.value}
                  onChange={(e) => this.props.handleChange(taskId, ['caseInformation'], e)}>
                  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
                  <StyledMenuItem value="Open">Open</StyledMenuItem>
                  <StyledMenuItem value="In Progress">In Progress</StyledMenuItem>
                  <StyledMenuItem value="Closed">Closed</StyledMenuItem>
                </StyledSelect>
            </TextField>

            <TextField>
              <StyledLabel htmlFor="CaseInformation_HowDidTheChildHearAboutUs">How did the child hear about us?</StyledLabel>
              <StyledSelect 
                name="howDidTheChildHearAboutUs"
                id="CaseInformation_HowDidTheChildHearAboutUs"
                value={this.props.form.caseInformation.howDidTheChildHearAboutUs.value}
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
                    id="CaseInformation_KeepConfidential" 
                    checked={this.props.form.caseInformation.keepConfidential.value} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'keepConfidential', 
                                              !this.props.form.caseInformation.keepConfidential.value)}
                />
                <StyledCheckboxLabel htmlFor="CaseInformation_KeepConfidential">Keep Confidential?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
                <Checkbox name='okForCaseWorkerToCall' 
                    id="CaseInformation_OkForCaseWorkerToCall"
                    checked={this.props.form.caseInformation.okForCaseWorkerToCall.value} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'okForCaseWorkerToCall', 
                                              !this.props.form.caseInformation.okForCaseWorkerToCall.value)}
                />
                <StyledCheckboxLabel htmlFor="CaseInformation_OkForCaseWorkerToCall">OK for case worker to call?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
                <Checkbox name='didYouDiscussRightsWithTheChild' 
                    id="CaseInformation_DidYouDiscussRightsWithTheChild"
                    checked={this.props.form.caseInformation.didYouDiscussRightsWithTheChild.value} 
                    onClick={(e) => 
                      this.props.handleCheckbox(taskId,
                                              ['caseInformation'],
                                              'didYouDiscussRightsWithTheChild', 
                                              !this.props.form.caseInformation.didYouDiscussRightsWithTheChild.value)}
                />
                <StyledCheckboxLabel htmlFor="CaseInformation_DidYouDiscussRightsWithTheChild">Did you discuss rights with the child?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='didTheChildFeelWeSolvedTheirProblem' 
                  id="CaseInformation_DidTheChildFeelWeSolvedTheirProblem"
                  checked={this.props.form.caseInformation.didTheChildFeelWeSolvedTheirProblem.value} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['caseInformation'],
                                            'didTheChildFeelWeSolvedTheirProblem', 
                                            !this.props.form.caseInformation.didTheChildFeelWeSolvedTheirProblem.value)}
              />
              <StyledCheckboxLabel htmlFor="CaseInformation_DidTheChildFeelWeSolvedTheirProblem">Did the child feel we solved their problem?</StyledCheckboxLabel>
            </CheckboxField>

            <CheckboxField>
              <Checkbox name='wouldTheChildRecommendUsToAFriend' 
                  id="CaseInformation_WouldTheChildRecommendUsToAFriend"
                  checked={this.props.form.caseInformation.wouldTheChildRecommendUsToAFriend.value} 
                  onClick={(e) => 
                    this.props.handleCheckbox(taskId,
                                            ['caseInformation'],
                                            'wouldTheChildRecommendUsToAFriend', 
                                            !this.props.form.caseInformation.wouldTheChildRecommendUsToAFriend.value)}
              />
              <StyledCheckboxLabel htmlFor="CaseInformation_WouldTheChildRecommendUsToAFriend">Would the child recommend us to a friend?</StyledCheckboxLabel>
            </CheckboxField>
          </ColumnarBlock>
        </TwoColumnLayout>
      </Container>
    );

    let tabs = [
      decorateTab("Caller Information", this.props.form.callerInformation),
      decorateTab("Child Information", this.props.form.childInformation),
      <Tab label="Issue Categorization" />,
      <Tab label="Case Information" />
    ];

    // TODO(nick): this is probably not the best way to hide the caller info tab
    if (this.props.form.callType.value !== callTypes.caller) {
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
          {this.state.tab < body.length - 1 ?
            <StyledNextStepButton 
              roundCorners={true}
              onClick={(e) => this.setState({ tab: this.state.tab + 1})}
            >
              Next
            </StyledNextStepButton> :
            <StyledNextStepButton
              roundCorners={true}
              onClick={() => this.props.handleSubmit(this.props.task)}
              disabled={!formIsValid(this.props.form)}
            >
              Submit
            </StyledNextStepButton>
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
        const id = `IssueCategorization_Category${props.category}_Subcategory${index}`;
        return (
          <CategoryCheckboxField>
            {/* TODO(nick): the inline style below is ugly */}
            <Checkbox 
              style={{ width: 30, height: 30, boxSizing: 'border-box' }}
              checked={props.form.caseInformation.categories[`category${cat}`][`sub${index}`].value} 
              id={id}
              onClick={() => props.handleCategoryToggle(props.taskId,
                                                        `category${cat}`,
                                                        `sub${index}`,
                                                        !props.form.caseInformation.categories[`category${cat}`][`sub${index}`].value)}
            />
            <StyledCheckboxLabel htmlFor={id}>Subcategory {index}</StyledCheckboxLabel>
          </CategoryCheckboxField>
        );
      })}
    </div>
  );
}

export default withTaskContext(TabbedForms);
