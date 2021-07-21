# Scripts

## Scripts index
- [createTwilioResources](#createTwilioResources)

## createTwilioResources
This script performs the all the steps described in the section 2 of the [Twilio account setup guide](https://benetech.app.box.com/services/box_for_office_online/4881/772893818136/1c0778.fd6b89fbc9665fdf8c58766af90d6d01715dee1c97316ac157d6947c10a6c71d?node_type=file).
It creates Twilio resources and saves the required values in Parameter Store, following our naming conventions.

As of 2021/07/21, this script:
- Creates the following Twilio resources:
  - Task Queue
  - Workflow
  - Sync Service
  - API Key
- Saves the following variables in AWS Parameter Store
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_WORKSPACE_SID
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_CHAT_WORKFLOW_SID
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_SYNC_SID
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_API_KEY
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_SECRET
  - <ENVIRONMENT>_TWILIO_<SHORT_HELPLINE>_CHAT_SERVICE_SID

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