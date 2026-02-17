/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "OR channelType IN ['webchat', 'facebook', 'instagram', 'whatsapp'] OR  twilioNumber IN ['messenger:103538615719253', 'twitter:1532353002387931139', 'instagram:17841453197793547'] OR to == '+578005190690'"
    flow_vars = {
      service_sid                       = "ZS70d962b047c1cd528ad2f2cae9f33b8b"
      environment_sid                   = "ZE5dd6ef3cbb63cc2418c472cd51fb2d16"
      operating_hours_function_sid      = "ZHb7ef5682d731ce326be6d61c8a2b2fcf"
      widget_from                       = "Te Guío"
      chat_blocked_message              = "Lamentablemente no puedes utilizar nuestros servicios."
      send_message_janitor_function_sid = "ZH1d6ed338c8ca9f49dfa0c084ef00b08b"
      co_assets_url                     = "https://co-assets-9314.twil.io/"
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
      /*instagram : {
        messaging_mode   = "conversations"
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },*/
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
          final_goodbye                   = "HX55c0608814d2800b657b2c2d6b5b641c"
          option_1_urgent_contact         = "HX144b8ed2b17f573de40d0e337bbcbc23"
          option_2_closure                = "HX4ce823bce8f62c243e7226c68d86e82a"
          option_2_goodbye                = "HX152fcaae45f6c04d036679094554641a"
          option_2_resources              = "HX9c05a9852e8261023b0c75c4a0e5c2fd"
          option_3_closure                = "HX2bdd69991e3e461e70280690ed33523e"
          option_3_ideas                  = "HX7ffa6c4b4dcf7c29afc6e6e17beef8b9"
          option_4_1                      = "HX0d3497d7674bb641d078453f8f061f93"
          option_4_2                      = "HX64df31cb58b6e2b21c0302b3a8794097"
          option_4_3                      = "HXf4e828824425f1354884a3e53df9395c"
          option_4_4                      = "HX836d9c686284d07fd0271ecc82b99048"
          option_4_5                      = "HX620db38dc228cf63749fe0f97b2a4927"
          option_4_6                      = "HX03583875520f22fa8021823245436cde"
          option_4_7                      = "HX50e903ae2318e54f081de3311a003ac7"
          option_4_closure                = "HXb94e0db1fb67a02bbde3e52b65a5bde4"
          option_4_worries                = "HX9d1ffde06b6cd70b10e912c4933c1678"
          option_5_1                      = "HXfec40ec77ba4559cb03e6fae9717aa6e"
          option_5_2                      = "HX8b87c7b8f90bb6cf0f6ec1416c4043cc"
          option_5_3                      = "HX640d1a252fb998d2e7a2d90670b4c538"
          option_5_4                      = "HX5e8740025683266e5c755684a07b81a8"
          option_5_5                      = "HX30a7ede433672c2136a8b10d57c4517d"
          option_5_6                      = "HX7067066ea30fcc28af5ea8347fad2daa"
          option_5_7                      = "HX1e518e86a2750839f6fd7741e4b1258a"
          option_5_8                      = "HX2d75a88fa847dd5d3b82bd2423552bfa"
          option_5_closure                = "HX4c36e82dae85138ced2ead9e2685951c"
          option_5_report                 = "HXdbbcb704dff541369d9c22ad667a5cbf"
          playback_menu                   = "HX01ab2d3bf78045eaa8d44f3586375ad9"
          playback_previous_menu          = "HX3609ec1794918ebc079a2dba3bf0406e"
          send_final_message              = "HXfa0b0af027661c98e1abb4b07d411f4d"
          send_welcome_and_request_reason = "HX51316ac7cf3f61de412423b6dfee7b82"
          terms_and_conditions            = "HX9f44703dfc9c79710183e7d27c394d8f"
          welcome_menu                    = "HX4f0154d4de8b830b0e1044e74ad53e6b"
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
