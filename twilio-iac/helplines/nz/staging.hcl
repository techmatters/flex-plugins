locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    #Studio flow
    flow_vars = {
      operating_hours_function_sid          = "ZH3ef7c7c03c4533829cc1b53b38197de7"
      capture_channel_with_bot_function_sid = "ZH26e3dd66fd428ae98074f9959a5ec8d3"
      chatbot_callback_cleanup_function_sid = "ZHfba53e17e98107e879e54299fd472796"
      send_message_run_janitor_sid          = "ZH223086290be816e9600ffac5655174ac"
      bot_language                          = "en-NZ"
      blocked_message                       = "Kia ora, you've been blocked from accessing Youthline's helpline and we are not able to read or receive further messages from you. If you think this is a mistake, please email complaints@youthline.co.nz with your name and contact details for this to be reviewed. If you are unsafe or require urgent support, please call 111 now."
      outside_country_message               = "Kia ora, only numbers or contacts from NZ can reach Youthline's helpline. We are not able to read or receive further messages from you. If you this is an error, please email complaints@youthline.co.nz with your name and contact details. If you are in NZ and feel unsafe or require urgent support, please call 111 now.  Outside of NZ please refer to www.findahelpline.com."
      ip_location_finder_url                = "https://hrm-staging.tl.techmatters.org/lambda/ipLocationFinder"
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true

    #Task router
    phone_numbers = {
      youthline : ["+18645238101", "+6498865661"],
      clinical : ["+6498867292"]
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
          allowed_shortcode_locations = "NZ,US,CL,ZA"
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
          wait_url                   = "https://nz-assets-8961.twil.io/busyLine"
          blocked_url                = "https://nz-assets-8961.twil.io/blocked_number.mp3"
          initial_message_url        = "https://nz-assets-8961.twil.io/initial_message.mp3"
          external_parties_number    = "+6498867292"

        }
        chatbot_unique_names = []
      },
      modica : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "modica"
        templatefile         = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-lex-priority-v3-lambda.tftpl"
        channel_flow_vars    = {
          regex_allowed_test_numbers = "modica:\\+(111)\\d{1,20}"
        }
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/nz/templates/studio-flows/instagram-lex-priority-v2-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+6498865661"
        templatefile         = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-lex-priority-v3-lambda.tftpl"
        channel_flow_vars    = {
          regex_allowed_test_numbers = "whatsapp:\\+(56|1|27)\\d{6,20}"
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}