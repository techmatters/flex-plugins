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

. ${script_dir}/migrateTFState-stage-common.sh
