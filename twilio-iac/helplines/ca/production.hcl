locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    helpline_region = "ca-central-1"

    #Studio flow
    flow_vars = {
      service_sid                       = "ZS052e3d62a635572170cfbff86fb1ce1d"
      environment_sid                   = "ZEf8ce7107c3db8823a53edc59e628946f"
      time_cycle_function_sid           = "ZH8551f80ce0f53ad437368a4c4bd91001"
      time_cycle_function_url           = "https://twilio-service-4854.twil.io/time_cycle"
      engagement_function_sid           = "ZH10286342f7b1a3952466a9d25eba5d1c"
      engagement_function_url           = "https://twilio-service-4854.twil.io/engagement"
      check_queue_capacity_function_sid = "ZS052e3d62a635572170cfbff86fb1ce1d"
      check_queue_capacity_function_url = "https://twilio-service-4854.twil.io/check_queue_capacity"
      workspace_sid                     = "WSf2e3f00412fa8cc45f4318b45a870ea5"
      english_queue_sid                 = "WQf659c270357487d2372a657b649a3a7a"
      french_queue_sid                  = "WQ43733e6ff913f64edafb10b041804c6e"
      serverless_service_sid            = "ZS2035e3023773cf7a1a482950df4f2150"
      serverless_environment_sid        = "ZE56ef3f078fe4b40ad57d4d4f63652210"
      operating_hours_function_sid      = "ZH77510a142c7bad7449d04e415b6c8187"
      operating_hours_function_url      = "https://serverless-3836-production.twil.io/operatingHours"
      check_counsellors_function_sid     = "ZH95bed62f9c0af98771e01cba4bd86d1f"
      check_counsellors_function_url     = "https://twilio-service-4854.twil.io/check_counsellors"
    }

    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/ca/templates/studio-flows/webchat.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      g2ton : {
        channel_type         = "voice"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/ca/templates/studio-flows/g2ton.tftpl"
        channel_flow_vars    = {
          en_number: "3656546095"
          fr_number: "3656546120"
          tr_number: "3656546032"

          #Twilio things
          check_counsellors_function_sid: "ZH95bed62f9c0af98771e01cba4bd86d1f"
          check_counsellors_function_url: "https://twilio-service-4854.twil.io/check_counsellors"
          g2tonen_queue_sid: "WQc774f3a1d09a93ae8eaba80be323e600"
          g2tonfr_queue_sid: "WQ61ef6d908e82fe48bb90bd259099260e"
          g2ttr_queue_sid: "WQb003ea620f2a0d7d2fbb5049a2b24762"

          #Recording URLs
          en_function_url: "https://twilio-service-4854.twil.io/6013_g2ton_english"
          fr_function_url: "https://twilio-service-4854.twil.io/6014_g2ton_french"
          tr_function_url: "https://twilio-service-4854.twil.io/6019_g2t_interpreter"
          en_tos_url: "https://twilio-service-4854.twil.io/G2TENToS.mp3"
          fr_tos_url: "https://twilio-service-4854.twil.io/G2TFRToS.mp3"
          en_privacy_url: "https://twilio-service-4854.twil.io/G2TEnPrivacy.mp3"
          fr_privacy_url: "https://twilio-service-4854.twil.io/G2TFrPrivacy.mp3"
          en_invalid_url: "https://twilio-service-4854.twil.io/EnInvalid.mp3"
          fr_invalid_url: "https://twilio-service-4854.twil.io/FrInvalid.mp3"
          en_disconnect_url: "https://twilio-service-4854.twil.io/EnDisconnect.mp3"
          fr_disconnect_url: "https://twilio-service-4854.twil.io/FrDisconnect.mp3"
          en_intro_url: "https://twilio-service-4854.twil.io/Msg10006G2TONEn.mp3"
          fr_intro_url: "https://twilio-service-4854.twil.io/Msg10006G2TFr.mp3"
          tr_intro_url: "https://twilio-service-4854.twil.io/Msg10006G2TTr.mp3"
          en_inflight_url: "https://twilio-service-4854.twil.io/Msg60011E.mp3"
          fr_inflight_url: "https://twilio-service-4854.twil.io/Msg60021.mp3"
          tr_inflight_url: "https://twilio-service-4854.twil.io/Msg60011Tr.mp3"
          fr_nocounsellors_url: "https://twilio-service-4854.twil.io/Msg60025.mp3"
          fr_issues_url: "https://twilio-service-4854.twil.io/FrTechIssues.mp3"
          fr_switch_url: "https://twilio-service-4854.twil.io/FrSwitchInterpreter.mp3"
          cyara_url: "https://twilio-service-4854.twil.io/cyara-vq-testaudio.wav"

        }
        chatbot_unique_names = []
      },
      g2tns : {
        channel_type         = "voice"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/ca/templates/studio-flows/g2tns.tftpl"
        channel_flow_vars    = {
          en_number: "5878043655"
          fr_number: "5878044316"

          #Twilio things
          check_counsellors_function_sid: "ZH95bed62f9c0af98771e01cba4bd86d1f"
          check_counsellors_function_url: "https://twilio-service-4854.twil.io/check_counsellors"
          g2tnsen_queue_sid: "WQe4336d184540020b222d80ab28805938"
          g2tnsfr_queue_sid: "WQe831ab19f57512b0fbcd3e4228df099e"
          g2ttr_queue_sid: "WQb003ea620f2a0d7d2fbb5049a2b24762"

          #Recording URLs
          en_function_url: "https://twilio-service-4854.twil.io/6015_g2tns_english"
          fr_function_url: "https://twilio-service-4854.twil.io/6016_g2tns_french"
          tr_function_url: "https://twilio-service-4854.twil.io/6019_g2t_interpreter"
          en_tos_url: "https://twilio-service-4854.twil.io/G2TENToS.mp3"
          fr_tos_url: "https://twilio-service-4854.twil.io/G2TFRToS.mp3"
          en_privacy_url: "https://twilio-service-4854.twil.io/G2TEnPrivacy.mp3"
          fr_privacy_url: "https://twilio-service-4854.twil.io/G2TFrPrivacy.mp3"
          en_invalid_url: "https://twilio-service-4854.twil.io/EnInvalid.mp3"
          fr_invalid_url: "https://twilio-service-4854.twil.io/FrInvalid.mp3"
          en_disconnect_url: "https://twilio-service-4854.twil.io/EnDisconnect.mp3"
          fr_disconnect_url: "https://twilio-service-4854.twil.io/FrDisconnect.mp3"
          en_intro_url: "https://twilio-service-4854.twil.io/Msg10006G2TONEn.mp3"
          fr_intro_url: "https://twilio-service-4854.twil.io/Msg10006G2TFr.mp3"
          en_inflight_url: "https://twilio-service-4854.twil.io/Msg60011E.mp3"
          fr_inflight_url: "https://twilio-service-4854.twil.io/Msg60021.mp3"
          fr_nocounsellors_url: "https://twilio-service-4854.twil.io/Msg60025.mp3"
          fr_issues_url: "https://twilio-service-4854.twil.io/FrTechIssues.mp3"
          fr_switch_english_url: "https://twilio-service-4854.twil.io/FrSwitchEnglish.mp3"

        }
        chatbot_unique_names = []
      }
    }
    phone_numbers = {
      khp : ["+12268878353"],
      g2ton : ["+13656546095", "+13656546120"],
      g2ttr : ["+13656546032", "+13656546120"],
      g2tns : ["+15878043655", "+15878044316"],
      ab211 : ["+15877412408", "+15876095765"],
      hc : ["+13656540516", "+13656520724"],
      training : ["+18252547345"]
    }

    hrm_transcript_retention_days_override = 90

    // THIS SHOULD BE REMOVED Serverless
    ui_editable = true

  }
}
