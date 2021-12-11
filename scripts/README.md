# Scripts

## Scripts index
- [setupNewAccount](#setupNewAccount)
- [copyFlow](#copyFlow)

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
| DATADOG_APP_ID         | Datadog Application Id |
| DATADOG_ACCESS_TOKEN   | Datadog Access Token |

### createTwilioResources
This script performs the steps described in the section 2 of the [Twilio account setup guide](https://benetech.app.box.com/file/772893818136).
It creates Twilio resources and saves the required values in Parameter Store, following our naming conventions.

As of 2021/09/28, this script:
- Creates the following Twilio resources:
  - Task Queue
  - Workflow
  - Sync Service
  - API Key
  - Post Survey required resources (survey task queue, survey workflow, survey task channel, HRM static secret).
- Create the following resources at AWS S3:
  - Bucket for storing uploaded documents
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
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_S3\_BUCKET\_DOCS
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_POST\_SURVEY\_BOT\_CHAT\_URL
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_OPERATING\_INFO\_KEY
  - \<ENVIRONMENT\>\DATADOG\_\<SHORT\_HELPLINE\>\APP\_ID
  - \<ENVIRONMENT\>\DATADOG\_\<SHORT\_HELPLINE\>\ACCESS\_TOKEN

### setupTwilioServerless
This scripts automates the step 3 of the [Twilio account setup guide](https://benetech.app.box.com/file/772893818136).

As of 2021/09/22, this script:
- Creates a `new-workflow.yml` workflow file in the root folder, with the targeted account. It will be configured ready to consume the parameters from AWS Parameter Store following the convention. If the file `templates/serverless-workflow-template` is out of sync with the Aselo Development deployment workflow file, the script will abort in order to prevent generating old version of workflows (manually disable this check if you are sure that you want the template version).

## copyFlow
This script copies over the config of a studio flow from one account to another. Is mainly used to create Messaging Flow when setting up a new helpline, but it can be tweeked to support updating other workflows.

To run the script:
- Create a `.env` file and fill it with the proper values (see next section).
- Install dependencies with `npm install`.
- Run `npm run copyFlow` on the root folder.

To run this script we need to provide the following environment

| Variable               | Description |
|------------------------|-------------|
| TWILIO_ACCOUNT_SID_SOURCE | Twilio account sid of the account that contains the desired Studio Flow |
| TWILIO_AUTH_TOKEN_SOURCE  | Auth token of the account that contains the desired Studio Flow |
| FLOW_TO_COPY              | Studio Flow sid to be copied over |
| TWILIO_ACCOUNT_SID_DESTINATION | Twilio account sid of the account where the Flow should be copied to |
| TWILIO_AUTH_TOKEN_DESTINATION | Auth token of the account where the Flow should be copied to |
