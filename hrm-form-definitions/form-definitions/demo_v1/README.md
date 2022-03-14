
# Aselo Demo Environments


## Overview

The Aselo demo environments are a mock Aselo helpline with a generic form definitions and default customizations. There are separate demo *staging* and demo *production* environments. We treat them the same way as any other staging and production environments. They have the following benefits:

- Clean, generic demo
- Eng can deploy new features to the demo environment and consider it “done,” before actually deploying to any of the actual helplines
- Security testing


## How the demo environments were created


### Step 1: Create Customization Files

1. Create a new customization sheets folder in Google Drive: `Tech Matters > Aselo > Implementations > Demo`.
2. Make copies from the `Master Customization Sheets` folder and put them in the new folder.
3. Created a new `joyce_demo_envs` branch in the flex-plugins repo.
4. Under the new branch, create a definitions folder `~/flex-plugins/hrm-form-definitions/form-definitions/demo_v1/` and copy all the `.../v1` jsons into this new folder.


### Step 2: Determine customization requirements

1. In Google Drive -- Edit customization spreadsheets to reflect the current CHI data frameworks (glossary [here](https://drive.google.com/file/d/18ouXwDYmHjXah32f09_Evouv9PG3Hgvl/view))
2. In Github -- Edit form definition jsons to reflect the customizations

**Here is how each json file correspondants to the google sheet:**

*Case forms*

`.../caseForms/HouseholdForm.json` <-> `Cases Data Capture - Demo > Household Member`  
`.../caseForms/IncidentForm.json` <-> `Cases Data Capture - Demo > Incident`  
`.../caseForms/PerpetratorForm.json` <-> `Cases Data Capture - Demo > Perpetrator`  
`.../caseForms/ReferralForm.json` <-> `Cases Data Capture - Demo > Referral`  
`.../CaseStatus.json` <-> `Cases Data Capture - Demo > Case Detail`  

*Contact (tabbed) forms*

`.../tabbedForms/CallerInformationTab.json` <-> `Contacts Data Capture - Demo > Caller Information`  
`.../tabbedForms/CaseInformationTab.json` <-> `Contacts Data Capture - Demo > Summary`  
`.../tabbedForms/ChildInformationTab.json` <-> `Contacts Data Capture - Demo > Child Information`  
`.../tabbedForms/IssueCategorizationTab.json` <-> `Contacts Data Capture - Demo > Categories`  

*Customize basic platform data*

`...CallTypeButtons.json` <-> `Basic Platform Data - Demo > Call Types`  
`.../CannedResponses.json` <-> `Custom Messages Data - Demo > Canned Responses`


> other customizations
> - Pre-survey chatbot
> - Post-survey chatbot
> - Operating hours
> - automated messaging
> - Insights
> - All channels supported
> - Permissions
> - Checkbox for if it’s a perpetrator, in the HouseholdForm.json


### Step 3: Test before pushing to Github

> ?


## Next phase features
- multiple languages
- multiple helplines
- Create a customized case form
- create a "customizable" symbol in the demo environment
- More advanced pre-survey chatbot and routing

