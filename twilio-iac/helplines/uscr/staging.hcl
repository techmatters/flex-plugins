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

     #Channels
    channels = {
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, welcome to LA CIRCLE. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
          voice_ivr_blocked_message  = "Apologies, your number has been blocked."

        }
        chatbot_unique_names = []
      }
    }
  }
}