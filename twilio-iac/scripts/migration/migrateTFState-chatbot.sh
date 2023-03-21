#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false
# export TF_LOG=TRACE

identifiers=(
  "^module.twilioChannel"
  "^module.voiceChannel"
  "^twilio_autopilot"
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
  "POST_SURVEY_BOT_CHAT_URL"
  "twilio_post_survey_bot_chat_url"
)

. ${script_dir}/migrateTFState-stage-common.sh