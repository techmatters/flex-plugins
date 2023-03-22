#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false
# export TF_LOG=TRACE

identifiers=(
  "^module.chatbots"
  "^module.custom_chatbots"
  "^twilio_autopilot"
  "^module.twilioChannel"
  "^module.voiceChannel"
  "^module.flex"
  "^module.customChannel"
  "POST_SURVEY_BOT_CHAT_URL"
  "twilio_post_survey_bot_chat_url"
)

. ${script_dir}/migrateTFState-stage-common.sh