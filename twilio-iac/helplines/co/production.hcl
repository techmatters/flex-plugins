/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "channelType IN ['webchat', 'facebook', 'instagram', 'whatsapp'] OR  twilioNumber IN ['messenger:103538615719253', 'twitter:1532353002387931139', 'instagram:17841453197793547'] OR to == '+578005190690'"
    flow_vars = {
      service_sid                       = "ZS70d962b047c1cd528ad2f2cae9f33b8b"
      environment_sid                   = "ZE5dd6ef3cbb63cc2418c472cd51fb2d16"
      operating_hours_function_sid      = "ZHb7ef5682d731ce326be6d61c8a2b2fcf"
      widget_from                       = "Te Guío"
      chat_blocked_message              = "Lamentablemente no puedes utilizar nuestros servicios."
      send_message_janitor_function_sid = "ZH1d6ed338c8ca9f49dfa0c084ef00b08b"
      co_assets_url                     = "https://co-assets-9314.twil.io"
      co_assets_service_sid             = "ZS528a5c774818383d1438d7a52f6ffcc9"
      co_assets_environment_sid         = "ZE827c023db67d4d68457d0bc81e7ee7ab"
      wait_five_seconds_function_sid    = "ZHfa9b1b7988a479b0e2abeaf9ef6791cc"
    }

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:103538615719253"
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode   = "conversations"
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking-lambda.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours-blocking-lambda.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          voice_ivr_blocked_message  = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
          voice_ivr_language         = "es-MX"
        }
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode   = "conversations"
        channel_type     = "whatsapp"
        contact_identity = "whatsapp:+5742045220"
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/whatsapp-templates.tftpl"
        channel_flow_vars = {
          widget_from                     = "Te Guío"
          chat_greeting_message           = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message            = "Lamentablemente no puedes utilizar nuestros servicios."
          message_closing                 = "Lo siento, no he logrado entender tu respuesta.\nPor favor, intenta comunicarte de nuevo con nosotros.\nAdiós!"
          message_wait                    = "¡Muchas gracias! En un momento uno de nuestros guías te atenderá. Por favor, espéranos.."
          message_no_terms                = "Entendemos tu decisión. Para garantizar la privacidad y seguridad de todos los usuarios, es necesario aceptar nuestra política de privacidad para acceder a Te Guío.\n\nSi en otro momento decides continuar, estaremos aquí para apoyarte. 💙\n\nEn Te Guío está bien preguntar."
          final_goodbye                   = "HXbd73b301b4e30cc68a762bcca7a9fa5f"
          option_1_urgent_contact         = "HX0a8fbcca24d4bf93c903dd3ab1bbdf61"
          option_2_closure                = "HXf3108948a5a337e16809c210dfb8c713"
          option_2_goodbye                = "HX116aab60c945f6355eb86bb9a6b26bff"
          option_2_resources              = "HX0a2801e8dd216bc8a82aab8c47c85712"
          option_3_closure                = "HX6d762bf173e40b87995bc4b5d7c3954f"
          option_3_ideas                  = "HX333c0384570267ea4b3db1a026dc56dd"
          option_4_1                      = "HXa96bb88bebe543cd7e8086059826af69"
          option_4_2                      = "HX60994a5d0c04b9e510402f891f8b3a40"
          option_4_3                      = "HX204f97d39e291c1de4e3393d801f9b64"
          option_4_4                      = "HXaf76c4745038b87a1309103d80c2a857"
          option_4_5                      = "HX1f907d4258147156bea30148893b2305"
          option_4_6                      = "HXdc46292fdbede6dd51c7f8ea13438020"
          option_4_7                      = "HX8b7934b7ee1135e9361bab4971df411e"
          option_4_closure                = "HXe9235660ee59fbadcd2fa127e6b21980"
          option_4_worries                = "HXab34bb3c7aaa0ed932902d340d2f965b"
          option_5_1                      = "HX763c0af055d0128dba58f7fe2eb6ce0b"
          option_5_2                      = "HX7e0ffc1824d8acbae05db65e3efaf461"
          option_5_3                      = "HXddfef60198b31406d3f076f3e9a033bb"
          option_5_4                      = "HX2fd17a1d2e7c4686c4429b669e3a213b"
          option_5_5                      = "HX883748b4d65b571856cf45b16951267d"
          option_5_6                      = "HXfe931bb3516df6ebfbbab2df1ff6ef81"
          option_5_7                      = "HX3c2f59df9e27aeddea982781458ae951"
          option_5_8                      = "HX075625e63df61597a3c4dcb3b6a8501b"
          option_5_closure                = "HX2ae74c45b859fbca1d4632692ea3a4fa"
          option_5_report                 = "HXe0b7fe44833604a448d9a42442c3dcfe"
          playback_menu                   = "HX46114576ed19afaeabb2c9c062e4d839"
          playback_previous_menu          = "HXdb9e165db04bd4128e7138e8689a6687"
          send_final_message              = "HXc50354b9a02d6afb3809854e5fc08522"
          send_welcome_and_request_reason = "HX95d4fff854edc4b50c1e04ca5a8a06b4"
          terms_and_conditions            = "HX5b0b9e555834f514a3173696c90c0c62"
          welcome_menu                    = "HX29b476b889cac7a5ec18aa53c1a95ca2"
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
