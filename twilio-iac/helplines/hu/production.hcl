locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "phone=='+3680984590' OR phone=='+12014821989' OR channelType=='web' OR isContactlessTask==true"

    flow_vars = {
      service_sid                           = "ZS87806dcc63d06994f4a3f9f38450ebdf"
      environment_sid                       = "ZE1c1ec4cb1c326f6cdd33d69a713ccc74"
      capture_channel_with_bot_function_sid = "ZHd97278ad2b96ffbc537706847f6ee926"
      operating_hours_function_sid          = "ZH2e902feddaccba9632510ff4ac889628"
    }
    
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/hu/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars    = {
          chat_blocked_message = "Зараз ми не можемо підключити вас до послуги. Сейчас мы не можем подключить вас к сервису."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/hu/templates/studio-flows/voice-ivr.tftpl"
        channel_flow_vars = {
          engagement_function_sid      = "ZH2ebce6cbec579b3a40ca30d9386b1d22"
          test_service_sid             = "ZSf3cffcef8a24637d9f46c60b4c106b83"
          test_service_environment_sid = "ZE2ae6219e757f93a730c5b095a3d2f8d5"
          test_service_url             = "https://kek-vonal-service-7245.twil.io"
          voice_ivr_blocked_message    = "Зараз ми не можемо підключити вас до послуги."
          voice_ivr_language           = "uk-UA"

        }
        chatbot_unique_names = []
      }
    }
  }

}
