#!/usr/bin/env bash

set -e

# List of partial identifiers to remove from Terraform state
identifiers=(
  "module.chatbots"
  "module.twilioChannel"
  "twilio_autopilot"
)

# Loop through the list of identifiers and remove them from Terraform state using Terragrunt
for identifier in "${identifiers[@]}"
do
  echo "Removing resources with identifier '$identifier' from Terraform state..."
  echo "terragrunt state rm $(terragrunt state list | grep \"$identifier\")"
done
