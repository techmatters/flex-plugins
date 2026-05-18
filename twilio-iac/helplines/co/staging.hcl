locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {


    custom_task_routing_filter_expression = "channelType IN ['web', 'messenger', 'instagram', 'whatsapp'] OR  twilioNumber IN ['messenger:103574689075106', 'twitter:1540032139563073538', 'instagram:17841454586132629', 'whatsapp:+12135834846'] OR to IN ['+17752526377','+578005190671']"
    operating_hours_enforced_override     = true

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars = {
          widget_from          = "Te Guío"
          chat_blocked_message = "Lamentablemente eres de y no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode   = "conversations"
        channel_type     = "messenger"
        contact_identity = "messenger:103574689075106"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv-lambda.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío",
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode   = "conversations"
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv-lambda.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode   = "conversations"
        channel_type     = "whatsapp"
        contact_identity = "whatsapp:+12135834846"
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/whatsapp-templates.tftpl"
        channel_flow_vars = {
          widget_from                     = "Te Guío"
          chat_greeting_message           = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message            = "Lamentablemente no puedes utilizar nuestros servicios."
          message_closing                 = "Lo siento, no he logrado entender tu respuesta.\nPor favor, intenta comunicarte de nuevo con nosotros.\nAdiós!"
          message_wait                    = "¡Muchas gracias! En un momento uno de nuestros guías te atenderá. Por favor, espéranos.."
          message_no_terms                = "Entendemos tu decisión. Para garantizar la privacidad y seguridad de todos los usuarios, es necesario aceptar nuestra política de privacidad para acceder a Te Guío.\n\nSi en otro momento decides continuar, estaremos aquí para apoyarte. 💙\n\nEn Te Guío está bien preguntar."
          final_goodbye                   = "HXa7301c08423546cbbba2b6e420ed86f1"
          option_1_urgent_contact         = "HX2f5a7f48d0b0b0eec4a20ee5f59f5b85"
          option_2_closure                = "HXb935060a75ed82ac4de9b2b7b848c833"
          option_2_goodbye                = "HXcc68b3866c1e92fa2da51715928e4d28"
          option_2_resources              = "HXfb6ef0985b9386d70c806df4e1a0c0b4"
          option_3_closure                = "HX67cc3515d008058dc256eb784b2dfadc"
          option_3_ideas                  = "HXb7b192ab9812830a166bfec5040fa0c1"
          option_4_1                      = "HX2c8d0fbd8805ec91fbfab69bc8d2f2d3"
          option_4_2                      = "HX4e709a841d2b200b433796fc358774d8"
          option_4_3                      = "HXc6c92788613a7d8a5cebf60bfc1e202e"
          option_4_4                      = "HX07ec17590b49165f33b3b7be30dd633f"
          option_4_5                      = "HXf48dba4eaaf21faaf2df894db61337b8"
          option_4_6                      = "HXfc02d4af0fcdab5265a0f0cd4b58c228"
          option_4_7                      = "HXb24ae48f56a6e35b2d3e00ac66b296a1"
          option_4_closure                = "HX6402298c0f0c4681040a2aec5b63745d"
          option_4_worries                = "HXf46139aeb08c1d233534dae8646c02eb"
          option_5_1                      = "HX4cd5839a0bb5e4cf37e4a46fa9eca08d"
          option_5_2                      = "HX1780dd891ed3d7ed9da892b9b52a8c99"
          option_5_3                      = "HXe0d8cf537dc3a3ac40ccd060f281c700"
          option_5_4                      = "HXc515ac2dbb0de4795d7074098dba1996"
          option_5_5                      = "HXb432f34e5573014fdd385c93ef728b1b"
          option_5_6                      = "HXac9ceb67ab5f40002e0a1faa41a8c1dd"
          option_5_7                      = "HX081ba587eb33d7a804e71d92d0993cf4"
          option_5_8                      = "HXd0a65011b66db9f41786aa76bb2d5028"
          option_5_closure                = "HX49d5199809113f10263805318a397456"
          option_5_report                 = "HX90118370badfb40de34e0256e59fc14d"
          playback_menu                   = "HXc41534084761dd0ffc98cf3bcaffeee1"
          playback_previous_menu          = "HX515fc59959ba6c8e20c81be376af3fb3"
          send_final_message              = "HX1e5d6c2a6092c40c6059c9056e0b7646"
          send_welcome_and_request_reason = "HX076f06e367c967998f42ab0fd63d6a07"
          terms_and_conditions            = "HX8cddbe4f1dddcd6b137ac70bfaeb5698"
          welcome_menu                    = "HX3a03e3c706ab704ca6c4303d3629901a"
        }
        chatbot_unique_names = []
      }
    }
    flow_vars = {
      service_sid                       = "ZSbf1bb881cc2e8db613ee6bca0e8e2c29"
      environment_sid                   = "ZE339938daa781b8e21baa45feae0e1afe"
      operating_hours_function_sid      = "ZH5fcc5dee5089c176acd0bd24e7fa873e"
      send_message_janitor_function_sid = "ZH74666f7e7ee6bc54405a2d37b98518f8"
      co_assets_url                     = "https://co-assets-2865.twil.io"
      co_assets_service_sid             = "ZSef16a2a1468522b0bff91ff2e78d6744"
      co_assets_environment_sid         = "ZE94dddf1f10abf3042db52ed92e07895c"
      wait_five_seconds_function_sid    = "ZH7d2de177a88e6a62cfdca6f535216d7c"
      chat_blocked_message              = "Lamentablemente no puedes utilizar nuestros servicios."
      widget_from                       = "Te Guío"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
