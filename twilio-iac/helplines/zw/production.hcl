locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)



  local_config = {
    enable_datadog_monitoring             = true
    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber == 'messenger:123236277715368'"


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
        channel_type         = "facebook"
        contact_identity     = "messenger:123236277715368"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
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

  }
}