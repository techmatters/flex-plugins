locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {

    custom_task_routing_filter_expression = "channelType IN ['web','messenger']  OR isContactlessTask == true OR  twilioNumber == 'messenger:103260519220529' OR aseloHostId == 'zw1' OR aseloHostId == 'zw2'"


    flow_vars = {
      widget_from          = "Childline Zimbabwe"
      chat_blocked_message = "Hi, you've been blocked from accessing Childline services and we are not able to read or receive further messages from you."
    }

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/zw/templates/studio-flows/messaging-greeting-message-blocking.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Thank you for contacting Childline Zimbabwe, a counsellor will be with you shortly. If this is an emergency or you wait longer than 30 min, we recommend you call us for free at 116."

        }
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:103260519220529"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/zw/templates/studio-flows/voice-ac.tftpl"
        channel_flow_vars = {
          voice_ivr_language        = "en-US",
          voice_ivr_blocked_message = "Hi, you've been blocked from accessing Childline services and we are not able to receive further calls from you."
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}