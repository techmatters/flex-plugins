/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {    custom_task_routing_filter_expression = "channelType IN ['web'] OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      widget_from          = "PCAVT"
      chat_blocked_message = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
    }

    channels = {
      chat : {
        channel_type         = "chat"
        messaging_mode = "conversations"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-preq-conv-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }


    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We’re having some technical problems at the moment, so messages might not go through. We’re working on it and will be back as soon as we can — thanks for your patience."
      voice_message                    = "We’re having some technical problems at the moment, so calls might not go through. We’re working on it and will be back as soon as we can — thanks for your patience."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging-us.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}