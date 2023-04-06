#!/usr/bin/env bash

# export TF_LOG=TRACE

# List of full identifiers to move split by comma
move_identifiers=(
  'module.aws.aws_ssm_parameter.main_group["POST_SURVEY_BOT_CHAT_URL"],aws_ssm_parameter.twilio_post_survey_bot_chat_url_old'
  'module.aws.aws_ssm_parameter.twilio_post_survey_bot_chat_url,aws_ssm_parameter.twilio_post_survey_bot_chat_url'
)

# List of partial identifiers to remove from Terraform state
delete_identifiers=(
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

. ${script_dir}/stage-common.sh