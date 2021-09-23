# Scripts

## Scripts index
- [setupNewAccount](#setupNewAccount)

## setupNewAccount
This scripts automates some of the steps to setup a new account for helpline, prompting the user asking which scripts should execute. The scripts executed by setupNewAccount are
- [createTwilioResources](#createTwilioResources)
- [setupTwilioServerless](#setupTwilioServerless)

To run the script:
- Create a `.env` file and fill it with the proper values (see next section).
- Install dependencies with `npm install`.
- Run `npm run setupNewAccount` on the root folder.

To run this script we need to provide the following environment
| Variable               | Description |
|------------------------|-------------|
| AWS_ACCESS_KEY_ID      | AWS script-user access key (or any other user with Parameter Store access) |
| AWS_SECRET_ACCESS_KEY  | AWS script-user access secret (or any other user with Parameter Store access) |
| TWILIO_ACCOUNT_SID     | Target Twilio account sid |
| TWILIO_AUTH_TOKEN      | Target Twilio account auth token |
| HELPLINE               | Helpline's friendly name (e.g. South Africa Helpline) |
| SHORT_HELPLINE         | Short code for this helpline (e.g. ZA) |
| ENVIRONMENT            | Target environment, one of Development, Staging or Production |

### createTwilioResources
This script performs the steps described in the section 2 of the [Twilio account setup guide](https://benetech.app.box.com/services/box_for_office_online/4881/772893818136/1c0778.fd6b89fbc9665fdf8c58766af90d6d01715dee1c97316ac157d6947c10a6c71d?node_type=file).
It creates Twilio resources and saves the required values in Parameter Store, following our naming conventions.

As of 2021/09/22, this script:
- Creates the following Twilio resources:
  - Task Queue
  - Workflow
  - Sync Service
  - API Key
  - Post Survey required resources (survey task queue, survey workflow, survey task channel, HRM static secret).
- Saves the following variables in AWS Parameter Store
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_WORKSPACE\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_CHAT\_WORKFLOW\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_SYNC\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_API\_KEY
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_SECRET
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_CHAT\_SERVICE\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_FLEX\_PROXY\_SERVICE\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_SURVEY\_WORKFLOW\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_HRM\_STATIC\_KEY

### setupTwilioServerless
This scripts automates the step 3 of the [Twilio account setup guide](https://benetech.app.box.com/services/box_for_office_online/4881/772893818136/1c0778.fd6b89fbc9665fdf8c58766af90d6d01715dee1c97316ac157d6947c10a6c71d?node_type=file).

As of 2021/09/22, this script:
- Creates a `new-workflow.yml` workflow file in the root folder, with the targeted account. It will be configured ready to consume the parameters from AWS Parameter Store following the convention. If the file `templates/serverless-workflow-template` is out of sync with the Aselo Development deployment workflow file, the script will abort in order to prevent generating old version of workflows (manually disable this check if you are sure that you want the template version).