/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web','voice'] OR isContactlessTask == true"
    flow_vars = {
      widget_from          = "LA CIRCLE"
      chat_blocked_message = "Sorry, you're not able to contact LA CIRCLE from this device or account"
    }

    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
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
      },
      outbound_number : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/uscr/templates/studio-flows/incoming_to_outbound_number.tftpl"
        channel_flow_vars = {
          voice_ivr_not_allowed_message = "Hello you are trying to contact LA CICLE. Sorry, we don't take calls directly from the public. Please call 911 if you are facing an emergency."
          voice_ivr_language         = "en-US"

        }
        chatbot_unique_names = []
      }
    }
  }
}