/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web','voice']"
    flow_vars = {
      widget_from          = "LA CIRCLE"
      chat_blocked_message = "Sorry, you're not able to contact LA CIRCLE from this device or account"
    }

    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/uscr/templates/studio-flows/webchat-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic-sd.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, thank you for calling CIRCLE. Please wait for an operator."
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
          voice_ivr_not_allowed_message = "Hello you are trying to contact LA CIRCLE. Sorry, we don't take calls directly from the public. Please call 911 if you are facing an emergency."
          voice_ivr_language            = "en-US"

        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're sorry, the CIRCLE Call Center is experiencing technical difficulties with our phone system. If this is an emergency, please call 911 or leave us a message at 213-816-4904. We apologize for the inconvenience and are working to be up and running shortly."
      voice_message                    = "We're sorry, the CIRCLE Call Center is experiencing technical difficulties with our phone system. If this is an emergency, please call 911 or leave us a message at 213-816-4904. We apologize for the inconvenience and are working to be up and running shortly."
      send_studio_message_function_sid = "ZHd9aa36ef63e286744c8677e919216853"
      call_action                      = "forward"
      forward_number                   = "+12055189944"
      recording_url                    = "https://<place_holder>.mp3"
    }
  }
}
