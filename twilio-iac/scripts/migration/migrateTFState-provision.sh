#!/usr/bin/env bash

set -e

export TERRAGRUNT_AUTO_INIT=false
# export TF_LOG=TRACE

identifiers=(
  "^module.chatbots"
  "^module.custom_chatbots"
  "^module.twilioChannel"
  "^module.voiceChannel"
  "^twilio_autopilot"
  "^module.flex"
  "^module.customChannel"
)

. ${script_dir}/migrateTFState-stage-common.sh