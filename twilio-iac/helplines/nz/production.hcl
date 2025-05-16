locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring = true
    #Studio flow
    flow_vars = {
      operating_hours_function_sid          = "ZHe0432d55b31c8e575d7630694502dd4b"
      capture_channel_with_bot_function_sid = "ZHe7354fbb19c8bb5b62ad78ddea99eade"
      chatbot_callback_cleanup_function_sid = "ZH94205e92c6cd6e7f6bb5858ebdbdbb9c"
      send_message_run_janitor_sid          = "ZH5e37c056ae0dfea42f8febd19d7bbd52"
      bot_language                          = "en-NZ"
      blocked_message                       = "Kia ora, you've been blocked from accessing Youthline's helpline and we are not able to read or receive further messages from you. If you think this is a mistake, please email complaints@youthline.co.nz with your name and contact details for this to be reviewed. If you are unsafe or require urgent support, please call 111 now."
      outside_country_message               = "Kia ora, only numbers or contacts from NZ can reach Youthline's helpline. We are not able to read or receive further messages from you. If you this is an error, please email complaints@youthline.co.nz with your name and contact details. If you are in NZ and feel unsafe or require urgent support, please call 111 now.  Outside of NZ please refer to www.findahelpline.com."
      ip_location_finder_url                = "https://hrm-production.tl.techmatters.org/lambda/ipLocationFinder"
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true

    #Task router
    phone_numbers = {
      youthline : ["+6498865633", "0800376633"],
      clinical : ["+6498867045"]
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-no-chatbot-operating-hours-flags-routing-v2.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Kia ora, we'll connect you with someone soon. Your conversation is confidential, but if we feel that you or someone else is at serious risk of harm, we may have to link in with other services. We'll let you know if that becomes necessary."
          widget_from           = "Youthline"
        }
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_12h):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=DAILY;INTERVAL=2;BYHOUR=4;BYMINUTE=0"
            timezone = "Pacific/Auckland"
          }
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nz/templates/studio-flows/voice.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Kia ora, thank you for contacting Youthline. One of our counsellors will get back to you as soon as we can. If you or someone else are in immediate danger, please call 111 immediately."
          voice_ivr_language         = "en-US"
          wait_url                   = "https://nz-assets-6577.twil.io/busyLine"
          blocked_url                = "https://nz-assets-6577.twil.io/blocked_number.mp3"
          initial_message_url        = "https://nz-assets-6577.twil.io/initial_message.mp3"
          external_parties_number    = "+6498867045"
        }
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_12h):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=DAILY;INTERVAL=2;BYHOUR=4;BYMINUTE=0"
            timezone = "Pacific/Auckland"
          }
        }
        chatbot_unique_names = []
      },
      modica : {
        messaging_mode         = "conversations"
        channel_type           = "custom"
        contact_identity       = "modica"
        templatefile           = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-lex-priority-v3.tftpl"
        channel_flow_vars      = {}
        chatbot_unique_names   = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_12h):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=DAILY;INTERVAL=2;BYHOUR=4;BYMINUTE=0"
            timezone = "Pacific/Auckland"
          }
        }
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/nz/templates/studio-flows/instagram-lex-priority-v2.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+6498865696"
        templatefile         = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-lex-priority-v3.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}