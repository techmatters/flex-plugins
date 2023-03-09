#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false

# List of partial identifiers to remove from Terraform state
identifiers=(
  "^module.chatbots"
  "^twilio_autopilot"
  "^module.hrmServiceIntegration"
  "^module.serverless"
  "^module.services"
  "^module.taskRouter"
  "^module.survey"
  "^module.aws"
  "^module.aws_monitoring"
  "^module.github"
)

# Generate a list of full identifiers matching the regex patterns
resource_list=$(terragrunt state list)
for identifier in "${identifiers[@]}"
do
  resource_list=$(echo "$resource_list" | grep -E "$identifier")
done

# Remove the resources from Terraform state using Terragrunt
if [[ -n "$resource_list" ]]; then
  echo "Removing resources matching the following patterns from Terraform state:"
  echo "$resource_list"
  echo "terragrunt state rm $resource_list"
else
  echo "No resources matching the specified patterns found in Terraform state"
fi
