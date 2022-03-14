# Aselo Demo Staging/Production Environments

Staging : 

Production : 

## Feature highlights

The "customizable" symbol:



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


##### Customize case forms
`/caseForms/HouseholdForm.json` <-> `Cases Data Capture - Demo > Household Member`
`/caseForms/IncidentForm.json` <-> `Cases Data Capture - Demo > Incident`
`/caseForms/PerpetratorForm.json` <-> `Cases Data Capture - Demo > Perpetrator`
`/caseForms/ReferralForm.json` <-> `Cases Data Capture - Demo > Referral`
`/CaseStatus.json` <-> `Cases Data Capture - Demo > Case Detail`


##### Customize contact (tabbed) forms
`/tabbedForms/CallerInformationTab.json` <-> `Contacts Data Capture - Demo > Caller Information`


### Step 3: Test before pushing to Github
Create a pull request with ABC members to look at



## Background on demo environments


## Next phase demo features
- multiple languages



Notes:
Callers formet (adult on behalf of a child, child, child on behalf of another child, person in a position of responsibility)
Repeat callers