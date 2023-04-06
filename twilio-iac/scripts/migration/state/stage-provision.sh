#!/usr/bin/env bash

# export TF_LOG=TRACE

# List of full identifiers to move split by comma
move_identifiers=()

# List of partial identifiers to remove from Terraform state
delete_identifiers=(
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

. ${script_dir}/stage-common.sh