locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring             = true
    custom_task_routing_filter_expression = "channelType IN ['web', 'messenger', 'whatsapp', 'instagram']  OR isContactlessTask == true OR  twilioNumber == 'instagram:17841400289612325', 'messenger:325981127456443', 'whatsapp:+15077097720'"

    workflow_vars = {
      helpline_webchat_location = "https://kellimni.com/"
      ecpm_webchat_location     = "https://empoweringchildren.gov.mt/"
    }
    #Studio flow
    flow_vars = {
      capture_channel_with_bot_function_sid = "ZH95285b8e20b443a167ada3db38b1ff99"
      chatbot_callback_cleanup_function_sid = "ZHe8f285fc47fc1150a87bb46a8eb467be"
      send_message_janitor_function_sid     = "ZH91ec531cde681192daf63e306db90d88"
      widget_from                           = "Kellimni"
      chat_blocked_message                  = "Sorry, you're not able to contact Kellimni from this device or account"
      outside_country_message               = "Thank you for reaching out to Kellimni.com. Please note that our services are available exclusively to individuals currently residing in Malta. If you are located in Malta but are using a VPN that does not indicate a Maltese IP address, we recommend connecting via a standard, approved internet protocol to access our support. If you are outside Malta, we encourage you to visit Throughline [https://silenthill.findahelpline.com/] to locate support services available in your region. We appreciate your understanding and hope you are able to find the assistance you need. Best regards, The Kellimni.com Team"
      ip_location_finder_url                = "https://hrm-production.tl.techmatters.org/lambda/ipLocationFinder"
    }


    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex-web-location-block.tftpl"
        channel_flow_vars    = {
          allowed_shortcode_locations = "MT"
        }
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
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:325981127456443"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex-conv-lambda.tftpl"
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
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+15077097720"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-whatsapp-lex-conv-lambda.tftpl"
        channel_flow_vars    = {
           regex_allowed_test_numbers = "whatsapp:\\+(<SHORT_CODE_HERE>)\\d{6,20}"
        }
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex-conv-lambda.tftpl"
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
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production-eu.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}