# Scripts

## Scripts index
- [createTwilioResources](#createTwilioResources)

## createTwilioResources
This script performs the all the steps described in the section 2 of the [Twilio account setup guide](https://benetech.app.box.com/services/box_for_office_online/4881/772893818136/1c0778.fd6b89fbc9665fdf8c58766af90d6d01715dee1c97316ac157d6947c10a6c71d?node_type=file).
It creates Twilio resources and saves the required values in Parameter Store, following our naming conventions.

As of 2021/09/28, this script:
- Creates the following Twilio resources:
  - Task Queue
  - Workflow
  - Sync Service
  - API Key
- Create the following resources at AWS S3:
  - Bucket for storing uploaded documents
- Saves the following variables in AWS Parameter Store
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_WORKSPACE\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_CHAT\_WORKFLOW\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_SYNC\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_API\_KEY
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_SECRET
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_CHAT\_SERVICE\_SID
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_S3\_BUCKET\_DOCS
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_POST\_SURVEY\_BOT\_CHAT\_URL
  - \<ENVIRONMENT\>\_TWILIO\_\<SHORT\_HELPLINE\>\_OPERATING\_INFO\_KEY

To run the script:
- Create a `.env` file and fill it with the proper values.
- Install dependencies with `npm install`.
- Run `npm run createTwilioResources` on the root folder.

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