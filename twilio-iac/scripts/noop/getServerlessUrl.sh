#!/usr/bin/env bash

helplineDir=$1

printf "These are the serverless URLs for ${helplineDir}:\n\n"

../scripts/getServerlessUrl.py ${helplineDir}

printf "\n\n"

echo "If none of those URLs are correct, you will need to manually update the serverless url placeholder in the following files:"
echo "    1. Open the twilio console: https://console.twilio.com/"
echo "    2. Navigate to the account you are working on"
echo "    3. Click \"Explore Products\" in the left menu"
echo "    4. Search for \"Functions and Assets\" and click on it"
echo "    5. Click \"Services\" in the left menu"
echo "    6. Click the \"serverless\" Unique Name in the service list"
echo "    7. Click on \"Service Details\" in the left menu"
echo "    8. Copy the correct domain under the \"Environments\" section"

printf "\n\n"

echo "Take note of the correct serverless url. In the next step, you will need to update the SSM parameter store with the correct serverless url."

printf "\n\n"

read -p "Press any key when you are done." -n 1 -r
