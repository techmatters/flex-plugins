# Aselo Demo Staging/Production Environments

## Overview

Staging : 

Production : 


## How I set up the demo environments

### Step 1: Create Customization Files
- Create new customization sheets folder in Google Drive: `Tech Matters > Aselo > Implementations > Demo`
	- Make copies from Master Customization Sheets
		- Basic Platform Data - Demo
		- ...
- Created a new branch: joyce_demo_envs
	- Created new form definitions folder: `~/flex-plugins/hrm-form-definitions/form-definitions/demo_v1/`

### Step 2: Determine customization requirements
Edit customization spreadsheets
- Reflect the current CHI data frameworks (glossary [here](https://drive.google.com/file/d/18ouXwDYmHjXah32f09_Evouv9PG3Hgvl/view))

Edit form definition jsons to reflect the customizations


#### Customize form definitions

**case forms**
`/caseForms/HouseholdForm.json` <-> `Cases Data Capture - Demo > Household Member`
`/caseForms/IncidentForm.json` <-> `Cases Data Capture - Demo > Incident`
`/caseForms/PerpetratorForm.json` <-> `Cases Data Capture - Demo > Perpetrator`
`/caseForms/ReferralForm.json` <-> `Cases Data Capture - Demo > Referral`
`/CaseStatus.json` <-> `Cases Data Capture - Demo > Case Detail`

**contact (tabbed) forms**
`/tabbedForms/CallerInformationTab.json` <-> `Contacts Data Capture - Demo > Caller Information`
`/tabbedForms/CaseInformationTab.json` <-> `Contacts Data Capture - Demo > Summary`
`/tabbedForms/ChildInformationTab.json` <-> `Contacts Data Capture - Demo > Child Information`
`/tabbedForms/IssueCategorizationTab.json` <-> `Contacts Data Capture - Demo > Categories`

#### Customize basic platform data

`/CallTypeButtons.json` <-> `Basic Platform Data - Demo > Call Types`
`/CannedResponses.json` <-> `Custom Messages Data - Demo > Canned Responses`


#### Customize insights
?

### Step 3: Test before pushing to Github
?

## Next phase features
- multiple languages
- multiple helplines
- Create a customized case form
- create a "customizable" symbol in the demo environment
- More advanced pre-survey chatbot and routing