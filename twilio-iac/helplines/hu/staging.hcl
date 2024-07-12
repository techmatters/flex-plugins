locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "phone=='+3680984590' OR phone=='+3612344587' OR channelType=='web' OR isContactlessTask==true"

    flow_vars = {
      service_sid                           = "ZSbb22d7f5e61b8fde6158ece8d28386f1"
      environment_sid                       = "ZEbaf991c98520207c96c75ee3592292ea"
      capture_channel_with_bot_function_sid = "ZH8d0ea0faa5530dd54872bb0a4b4dca51"
      operating_hours_function_sid          = "ZH2fcbed05a786c45af4628c488f63fb02"
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
          engagement_function_sid      = "ZH5cbc392ca6defc403591a2c7cf5b808f"
          test_service_sid             = "ZS0334b33f8c50e894e7647aa368bedb0e"
          test_service_environment_sid = "ZE96e60d55af1b2e503a2b37e2cffb1230"
          test_service_url             = "https://test-service-1476.twil.io"
          voice_ivr_blocked_message    = "Зараз ми не можемо підключити вас до послуги."
          voice_ivr_language           = "uk-UA"

        }
        chatbot_unique_names = []
      }
    }
  }
}
