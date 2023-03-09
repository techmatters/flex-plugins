#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false

identifiers=(
  "^module.chatbots"
  "^module.twilioChannel"
  "^twilio_autopilot"
  "^module.flex"
  "^module.customChannel"
)

printf "Getting list of all resources in Terraform state..."
full_resource_list=$(terragrunt state list)
printf "Done!\n\n"

printf "Filtering resources matching the patterns:"
for identifier in "${identifiers[@]}"; do
  matched_resources=$(echo "$full_resource_list" | grep -E "$identifier" || true)
  if [ -n "$matched_resources" ]; then
    resource_list+="$matched_resources"
  fi
done
printf "Done!\n\n"

if [ -n "$resource_list" ]; then
  echo "Will remove the following resources from Terraform state:"
  echo "$resource_list"

  printf "\n\n"

  read -p "Do you want to remove the preceeding resources from the state?(y/N)" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting old secrets from ${old_key}"
    echo "terragrunt state rm $resource_list"
  else
    echo "Aborting..."
    exit 1
  fi
else
  echo "No resources matching the specified patterns found in Terraform state"
fi
