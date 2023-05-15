#!/usr/bin/env bash

# export TF_LOG=TRACE

# List of full identifiers to move split by comma
move_identifiers=()

# List of partial identifiers to remove from Terraform state
delete_identifiers=(
  "^module.chatbots"
  "^module.custom_chatbots"
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

. ${script_dir}/stage-common.sh
