#!/usr/bin/env bash

set -e

# List of partial identifiers to remove from Terraform state
identifiers=(
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
