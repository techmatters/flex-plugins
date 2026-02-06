locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    lex_v2_bot_languages                  = { }
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN [ 'whatsapp', 'instagram'] OR (channelType IN ['web'] AND preEngagementData.area == 'Main Land') OR (channelType IN ['web'] AND preEngagementData.language == 'sw_TZ' AND worker.routing.skills HAS 'Swahili') OR (channelType IN ['messenger'] AND facebookPage == 'mainland') OR twilioNumber == 'instagram:17841472327571934'"

    #Studio flow
    flow_vars = {
      widget_from                           = "National Child Helpline"
      chat_greeting_message                 = "Hello! Welcome to the National Child Helpline 116. Please hold on for a while and we will attend to you as soon as we can.\n\nHabari! Karibu kwenye Nambari ya Msaada ya Kitaifa ya Mtoto 116. Tafadhali subiri kwa muda na tutakuhudumia haraka tuwezavyo."
      chat_blocked_message                  = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you.\n\nHujambo, umezuiwa kufikia huduma zetu na hatuwezi kusoma au kupokea ujumbe zaidi kutoka kwako."
      send_message_janitor_function_sid     = "ZH167067f5634dd8326504f0c43b5ac4e0"
      capture_channel_with_bot_function_sid = "ZH2b185a0342af6f903bf34461036006b7"
      chatbot_callback_cleanup_function_sid = "ZH00d5dbaf3effa441720fe6d04b856ddc"
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
        contact_identity     = "messenger:565233119996327"
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_zanzibar : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:709371978917654"
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+18454704393"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/tz/templates/studio-flows/messaging-custom-channel-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}