locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN [ 'whatsapp', 'instagram'] OR (channelType IN ['web'] AND preEngagementData.area == 'Main Land') OR (channelType IN ['web'] AND preEngagementData.language == 'sw_TZ' AND worker.routing.skills HAS 'Swahili') OR (channelType IN ['messenger'] AND facebookPage == 'mainland') OR isContactlessTask == true OR twilioNumber == 'instagram:17841402931866137'"

    #Studio flow
    flow_vars = {
      widget_from                           = "National Child Helpline"
      send_message_janitor_function_sid     = "ZHd8b1112c9bc6a7798fa18c82cd3bff2d"
      capture_channel_with_bot_function_sid = "ZH2b185a0342af6f903bf34461036006b7"
      chatbot_callback_cleanup_function_sid = "ZH6fb9b38bf4c52e8d4786e7a24f434cc9"
      chat_greeting_message                 = "Hello! Welcome to the National Child Helpline 116. Please hold on for a while and we will attend to you as soon as we can.\n\nHabari! Karibu kwenye Nambari ya Msaada ya Kitaifa ya Mtoto 116. Tafadhali subiri kwa muda na tutakuhudumia haraka tuwezavyo."
      chat_blocked_message                  = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you.\n\nHujambo, umezuiwa kufikia huduma zetu na hatuwezi kusoma au kupokea ujumbe zaidi kutoka kwako."
      error_message                         = "There has been an error with your message, please try writing us again."
      bot_language                          = "en-US"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_mainland : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:151504668210452"
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_zanzibar : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:709828666084671"
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-custom-channel-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}