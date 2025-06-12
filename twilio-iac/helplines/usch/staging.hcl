/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars                             = {}
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
  #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/webchat-basic.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, welcome to Childhelp. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
          voice_ivr_blocked_message  = "Apologies, your number has been blocked."

        }
        chatbot_unique_names = []
      },
      sms_childhelp : {
        messaging_mode       = "conversations"
        channel_type         = "sms"
        contact_identity     = "+14809999197"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      sms_courage_first : {
        messaging_mode       = "conversations"
        channel_type         = "sms"
        contact_identity     = "+16066032348"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  
  }
}