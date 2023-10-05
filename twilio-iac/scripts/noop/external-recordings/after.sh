#!/usr/bin/env bash

short_helpline=$(terraform output -raw short_helpline)
environment=$(terraform output -raw environment)
access_key_id=$(terraform output -raw iam_access_key_id)
secret_ssm_key=$(terraform output -raw iam_secret_access_key_ssm_key)
bucket_url=$(terraform output -raw bucket_url)

function press_any_key_to_continue {
    read -n 1 -s -r -p "Press any key to continue"
    echo # Add a line break for better output formatting.
}

printf "The twilio portion of external recordings is not currently automatable. Please follow these steps to complete the setup:\n\n"

echo "
Collect Required Information.

1. Read everything in a stage before completing if this is your first time.

2. You will need to lookup the IAM secret key for the ${short_helpline}-${short_environment}-twilio-external-recordings IAM user in the AWS console here:
https://us-east-1.console.aws.amazon.com/systems-manager/parameters${secret_ssm_key}/description?region=us-east-1&tab=Table

3. Verify that the service config for the account is clean by running \`make service-config-apply HL=${short_helpline} HL_ENV=${environment}\` and checking the output for pending changes. If there are pending changes

4. Read everything in a stage before completing if this is your first time.
"

press_any_key_to_continue

echo "
Configure the AWS Credential for External Recordings in Twilio.

1. Login to https://console.twilio.com/

2. Go to the console for the ${short_helpline}-${environment} helpline

3. Go to the Voice Credentials page:
https://console.twilio.com/us1/develop/voice/settings/voice-credentials?frameUrl=%2Fconsole%2Fvoice%2Fvoice-credentials%2Fcredentials%2Fpublic-key%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fvoice%2Fvoice-credentials%2Fcredentials%2Fpublic-key%3F__override_layout__%3Dembed%26x-target-region%3Dus1%26bifrost%3Dtrue

4. Go to the AWS Credentials tab.

5. If a credential with the friendly name "External Recordings" already exists, continue to the next setup stage. Otherwise, click the "Create a new AWS Credential" button.

6. Fill in the following information:

Friendly Name: External Recordings
AWS Access Key Id: ${access_key_id}
AWS Access Secret Key: <the secret key you looked up in step 1>

7. Click the "Create" button.
"

press_any_key_to_continue

echo "
Enable External Voice Recording in Twilio.

** ONLY AN ACCOUNT ADMIN CAN COMPLETE THIS STEP, YOU MAY NEED TO ASK FOR HELP **

1. Navigate to the "Voice Settings" dashboard in twilio:
https://console.twilio.com/us1/develop/voice/settings/general?frameUrl=%2Fconsole%2Fvoice%2Fsettings%3Fx-target-region%3Dus1

2. Scroll down to the "Voice Recording External Storage" section.

3. Click the "Enabled" radio button.

4. Select the "External Recordings" credential from the dropdown.

5. Enter the following value in the "S3 Bucket" field: ${bucket_url}

6. WARNING: AS SOON AS YOU CLICK SAVE, EXTERNAL RECORDINGS WILL BE ENABLED FOR ALL CALLS TO THIS HELPLINE, the followup service config step MUST be completed ASAP to avoid contacts being saved incorrectly to HRM and Insights.
   Click the "Save" button.
"

press_any_key_to_continue

printf "You have completed the setup for external recordings!\n\n"
