#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false
# export TF_LOG=TRACE

identifiers=(
  "^module.twilioChannel"
  "^module.voiceChannel"
  "^module.flex"
  "^module.customChannel"
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