import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import { BottomButtonBar,
         CategoryCheckboxField,
         CheckboxField,
         ColumnarBlock,
         Container,
         ErrorText,
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
import decorateTab from './decorateTab';
import { formIsValid } from '../states/ValidationRules';
import FieldSelect from './FieldSelect';
import FieldText from './FieldText'


class TabbedForms extends React.PureComponent {
  state = {
    tab: 0,
  };

  tabChange = (event, tab) => this.setState({tab});

  curriedHandleChange = (parents, name) =>
  (e) => this.props.handleChange(this.props.task.taskSid, parents, name, e.target.value);

  curriedHandleFocus = (parents, name) =>
    () => this.props.handleFocus(this.props.task.taskSid, parents, name);

  defaultEventHandlers = (parents, name) => ({
    handleBlur: this.props.handleBlur,
    handleChange: this.curriedHandleChange(parents, name),
    handleFocus: this.curriedHandleFocus(parents, name),
  });

  render() {
    const taskId = this.props.task.taskSid;

    let body = new Array(3);

    // Caller Information
    body[0] = (
      <Container>
        <NameFields>
          <FieldText
            id="CallerInformation_FirstName"
            label="First name"
            field={this.props.form.callerInformation.name.firstName}
            {...this.defaultEventHandlers(['callerInformation', 'name'], 'firstName')}
          />

          <FieldText
            id="CallerInformation_LastName"
            label="Last name"
            field={this.props.form.callerInformation.name.lastName}
            {...this.defaultEventHandlers(['callerInformation', 'name'], 'lastName')}
          />
        </NameFields>

        <TwoColumnLayout>
          <ColumnarBlock>
            <FieldSelect
              store={this.props.form.callerInformation.relationshipToChild}
              id="CallerInformation_RelationshipToChild"
              name="relationshipToChild"
              label="Relationship to Child"
              options={['Friend', 'Neighbor', 'Parent', 'Grandparent', 'Teacher', 'Other']}
              {...this.defaultEventHandlers(['callerInformation'], 'relationshipToChild')}
            />

            <FieldSelect
              store={this.props.form.callerInformation.gender}
              id="CallerInformation_Gender"
              name="gender"
              label="Gender"
              options={['Male', 'Female', 'Other', 'Unknown']}
              {...this.defaultEventHandlers(['callerInformation'], 'gender')}
            />

            <FieldSelect
              store={this.props.form.callerInformation.age}
              id="CallerInformation_Age"
              name="age"
              label="Age"
              options={['0-3', '4-6', '7-9', '10-12', '13-15', '16-17', '18-25', '>25']}
              {...this.defaultEventHandlers(['callerInformation'], 'age')}
            />

            <FieldSelect
              store={this.props.form.callerInformation.language}
              id="CallerInformation_Language"
              name="language"
              label="Language"
              options={['Language 1', 'Language 2', 'Language 3']}
              {...this.defaultEventHandlers(['callerInformation'], 'language')}
            />

            <FieldSelect
              store={this.props.form.callerInformation.nationality}
              id="CallerInformation_Nationality"
              name="nationality"
              label="Nationality"
              options={['Nationality 1', 'Nationality 2', 'Nationality 3']}
              {...this.defaultEventHandlers(['callerInformation'], 'nationality')}
            />

            <FieldSelect
              store={this.props.form.callerInformation.ethnicity}
              id="CallerInformation_Ethnicity"
              name="ethnicity"
              label="Ethnicity"
              options={['Ethnicity 1', 'Ethnicity 2', 'Ethnicity 3']}
              {...this.defaultEventHandlers(['callerInformation'], 'ethnicity')}
            />
          </ColumnarBlock>

          <ColumnarBlock>
            <FieldText
              id="CallerInformation_StreetAddress"
              label="Street address"
              field={this.props.form.callerInformation.location.streetAddress}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'streetAddress')}
            />

            <FieldText
              id="CallerInformation_City"
              label="City"
              field={this.props.form.callerInformation.location.city}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'city')}
            />

            <FieldText
              id="CallerInformation_State/Country"
              label="State/County"
              field={this.props.form.callerInformation.location.stateOrCounty}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'stateOrCounty')}
            />

            <FieldText
              id="CallerInformation_PostalCode"
              label="Postal code"
              field={this.props.form.callerInformation.location.postalCode}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'postalCode')}
            />

            <FieldText
              id="CallerInformation_Phone#1"
              label="Phone #1"
              field={this.props.form.callerInformation.location.phone1}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'phone1')}
            />

            <FieldText
              id="CallerInformation_Phone#2"
              label="Phone #2"
              field={this.props.form.callerInformation.location.phone2}
              {...this.defaultEventHandlers(['callerInformation', 'location'], 'phone2')}
            />
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
            <FieldSelect
              store={this.props.form.childInformation.gender}
              id="ChildInformation_Gender"
              name="gender"
              label="Gender"
              options={['Male', 'Female', 'Other', 'Unknown']}
              {...this.defaultEventHandlers(['childInformation'], 'gender')}
            />

            <FieldSelect
              store={this.props.form.childInformation.age}
              id="ChildInformation_Age"
              name="age"
              label="Age"
              options={['0-3', '4-6', '7-9', '10-12', '13-15', '16-17', '18-25', '>25']}
              {...this.defaultEventHandlers(['childInformation'], 'age')}
            />

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
        {this.props.form.caseInformation.categories.error ? 
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px'}}>
            <ErrorText>{this.props.form.caseInformation.categories.error}</ErrorText>
          </div>
           : ''}
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
    // this is hokey
    // we need to be able to mark that the categories field has been touched
    // the only way to do this that I see is this.  Blech.
    if (this.state.tab === 2 && !this.props.form.caseInformation.categories.touched) {
      this.props.handleFocus(taskId, ['caseInformation'], 'categories');
    }

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
      decorateTab("Issue Categorization", this.props.form.caseInformation.categories),
      <Tab label="Case Information" />  // normal validate logic won't work here
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
