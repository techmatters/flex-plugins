locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    #Studio flow
    flow_vars = {
      service_sid                       = "ZSb631f562c8306085ceb8329349fdd60b"
      environment_sid                   = "ZEd72a0800eb472d514e48977ffab9b642"
      time_cycle_function_sid           = "ZH3ee5654cb3c8cda06c2aaf84593b11a6"
      time_cycle_function_url           = "https://test-service-dee-4583.twil.io/time_cycle"
      engagement_function_sid           = "ZH946d079ec6be9b1b899a6cf30be0660f"
      engagement_function_url           = "https://test-service-dee-4583.twil.io/engagement"
      check_queue_capacity_function_sid = "ZH12fcf06152bfd4dceacd1df0a4af7198"
      check_queue_capacity_function_url = "https://test-service-dee-4583.twil.io/check_queue_capacity"
      workspace_sid                     = "WS33c3c168dad3428ead7c7a79e16460e3"
      english_queue_sid                 = "WQ3edc0fed2331d352819501c6848d95f6"
      french_queue_sid                  = "WQ0ff276ab319c71ee66d1a5cc9a40d834"
      serverless_service_sid            = "ZS978c59a0e335c77ed1fc77715a806d42"
      serverless_environment_sid        = "ZE1480176353cd0c0ea1825614e9806ed6"
      operating_hours_function_sid      = "ZHc3676ca6ff87edc2b4b4c9d2a4b22c82"
      operating_hours_function_url      = "https://serverless-8126-production.twil.io/operatingHours"
      check_counsellors_function_sid    = "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
      check_counsellors_function_url    = "https://test-service-dee-4583.twil.io/check_counsellors"
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
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/ca/templates/studio-flows/g2ton.tftpl"
        channel_flow_vars = {
          en_number : "8446052258"
          fr_number : "8559768844"
          tr_number : "8882913868"

          #Twilio things
          check_counsellors_function_sid : "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
          check_counsellors_function_url : "https://test-service-dee-4583.twil.io/check_counsellors"
          g2tonen_queue_sid : ""
          g2tonfr_queue_sid : "WQf14ba3410c3614abd554652d7531f4d0"
          g2ttr_queue_sid : "WQe668c7c05bfb1a0748635e7ef0a2b30e"

          #Recording URLs
          en_function_url : "https://test-service-dee-4583.twil.io/6013_g2ton_english"
          fr_function_url : "https://test-service-dee-4583.twil.io/6014_g2ton_french"
          tr_function_url : "https://test-service-dee-4583.twil.io/6019_g2t_interpreter"
          en_tos_url : "https://test-service-dee-4583.twil.io/G2TENToS.mp3"
          fr_tos_url : "https://test-service-dee-4583.twil.io/G2TFRToS.mp3"
          en_privacy_url : "https://test-service-dee-4583.twil.io/G2TEnPrivacy.mp3"
          fr_privacy_url : "https://test-service-dee-4583.twil.io/G2TFrPrivacy.mp3"
          en_invalid_url : "https://test-service-dee-4583.twil.io/EnInvalid.mp3"
          fr_invalid_url : "https://test-service-dee-4583.twil.io/FrInvalid.mp3"
          en_disconnect_url : "https://test-service-dee-4583.twil.io/EnDisconnect.mp3"
          fr_disconnect_url : "https://test-service-dee-4583.twil.io/FrDisconnect.mp3"
          en_intro_url : "https://test-service-dee-4583.twil.io/Msg10006G2TONEn.mp3"
          fr_intro_url : "https://test-service-dee-4583.twil.io/Msg10006G2TFr.mp3"
          tr_intro_url : "https://test-service-dee-4583.twil.io/Msg10006G2TTr.mp3"
          en_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011E.mp3"
          fr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60021.mp3"
          tr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011Tr.mp3"
          fr_nocounsellors_url : "https://test-service-dee-4583.twil.io/Msg60025.mp3"
          fr_issues_url : "https://test-service-dee-4583.twil.io/FrTechIssuesmp3"
          fr_switch_url : "https://test-service-dee-4583.twil.io/FrSwitchInterpreter.mp3"
          cyara_url : "https://test-service-dee-4583.twil.io/cyara-vq-testaudio.wav"

        }
        chatbot_unique_names = []
      },
      g2tns : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/ca/templates/studio-flows/g2tns.tftpl"
        channel_flow_vars = {
          en_number : "5814810744"
          fr_number : "5812215204"

          #Twilio things
          check_counsellors_function_sid : "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
          check_counsellors_function_url : "https://test-service-dee-4583.twil.io/check_counsellors"
          g2tnsen_queue_sid : "WQ08c18a81b8a8fbc12a1e143c47dea7e1"
          g2tnsfr_queue_sid : "WQea1bcc502ff7d4ec64deddada25f1467"
          g2ttr_queue_sid : "WQe668c7c05bfb1a0748635e7ef0a2b30e"

          #Recording URLs
          intro_url : "https://test-service-dee-4583.twil.io/G2TNS_Intro.mp3"
          en_function_url : "https://test-service-dee-4583.twil.io/6015_g2tns_english"
          fr_function_url : "https://test-service-dee-4583.twil.io/6016_g2tns_french"
          tr_function_url : "https://test-service-dee-4583.twil.io/6019_g2t_interpreter"
          en_tos_url : "https://test-service-dee-4583.twil.io/G2TENToS.mp3"
          fr_tos_url : "https://test-service-dee-4583.twil.io/G2TFRToS.mp3"
          en_privacy_url : "https://test-service-dee-4583.twil.io/G2TEnPrivacy.mp3"
          fr_privacy_url : "https://test-service-dee-4583.twil.io/G2TFrPrivacy.mp3"
          en_invalid_url : "https://test-service-dee-4583.twil.io/EnInvalid.mp3"
          fr_invalid_url : "https://test-service-dee-4583.twil.io/FrInvalid.mp3"
          en_disconnect_url : "https://test-service-dee-4583.twil.io/EnDisconnect.mp3"
          fr_disconnect_url : "https://test-service-dee-4583.twil.io/FrDisconnect.mp3"
          en_intro_url : "https://test-service-dee-4583.twil.io/Msg10006G2TONEn.mp3"
          fr_intro_url : "https://test-service-dee-4583.twil.io/Msg10006G2TFr.mp3"
          en_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011E.mp3"
          fr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60021.mp3"
          fr_nocounsellors_url : "https://test-service-dee-4583.twil.io/Msg60025.mp3"
          fr_issues_url : "https://test-service-dee-4583.twil.io/FrTechIssuesmp3"
          fr_switch_english_url : "https://test-service-dee-4583.twil.io/FrSwitchEnglish.mp3"
          fr_switch_url : "https://test-service-dee-4583.twil.io/FrSwitchInterpreter.mp3"
          frtr_function_url : "https://test-service-dee-4583.twil.io/6004_khp_french_int"

        }
        chatbot_unique_names = []
      },
      khp_main : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/ca/templates/studio-flows/khp_main.tftpl"
        channel_flow_vars = {

          #Twilio things
          check_counsellors_function_sid : "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
          check_counsellors_function_url : "https://test-service-dee-4583.twil.io/check_counsellors"
          khpen_queue_sid : "WQc92043986a3a474a991125031a0acb55"
          khpfr_queue_sid : "WQ35e4fceff9d82cc1d9ce2a49a1c93330"
          khptr_queue_sid : "WQ8351ee438539d776c083c4286f51bad9"
          khpfrtr_queue_sid : "WQc628604231d70284771389da92867ae9"
          khpind_queue_sid : "WQ332b547dac5e90660af40138ab002f05"

          #Recording URLs
          menu_url : "https://test-service-dee-4583.twil.io/KHP_Main.mp3"
          en_function_url : "https://test-service-dee-4583.twil.io/6001_khp_english"
          fr_function_url : "https://test-service-dee-4583.twil.io/6002_khp_french"
          tr_function_url : "https://test-service-dee-4583.twil.io/6003_khp_int"
          frtr_function_url : "https://test-service-dee-4583.twil.io/6004_khp_french_int"
          ind_function_url : "https://test-service-dee-4583.twil.io/6005_khp_ind_int"
          en_tos_url : "https://test-service-dee-4583.twil.io/KHPENToS.mp3"
          fr_tos_url : "https://test-service-dee-4583.twil.io/KHPFRToS.mp3"
          en_privacy_url : "https://test-service-dee-4583.twil.io/KHPENPrivacy.mp3"
          fr_privacy_url : "https://test-service-dee-4583.twil.io/KHPFRPrivacy.mp3"
          en_invalid_url : "https://test-service-dee-4583.twil.io/EnInvalid.mp3"
          fr_invalid_url : "https://test-service-dee-4583.twil.io/FrInvalid.mp3"
          en_disconnect_url : "https://test-service-dee-4583.twil.io/EnDisconnect.mp3"
          fr_disconnect_url : "https://test-service-dee-4583.twil.io/FrDisconnect.mp3"
          en_intro_url : "https://test-service-dee-4583.twil.io/Msg10006E.mp3"
          fr_intro_url : "https://test-service-dee-4583.twil.io/MSG10006F.mp3"
          tr_intro_url : "https://test-service-dee-4583.twil.io/MSG10006Tr.mp3"
          en_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011E.mp3"
          fr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60021.mp3"
          tr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011Tr.mp3"
          fr_nocounsellors_url : "https://test-service-dee-4583.twil.io/Msg60025.mp3"
          fr_issues_url : "https://test-service-dee-4583.twil.io/FrTechIssues.mp3"
          fr_switch_url : "https://test-service-dee-4583.twil.io/FrSwitchInterpreter.mp3"
          ind_subintro_url : "https://test-service-dee-4583.twil.io/KHP_SubIntro_Indigeneous.mp3"
          cyara_url : "https://test-service-dee-4583.twil.io/cyara-vq-testaudio.wav"

        }
        chatbot_unique_names = []
      },
      ab211 : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/ca/templates/studio-flows/ab211.tftpl"
        channel_flow_vars = {

          #Twilio things
          check_counsellors_function_sid : "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
          check_counsellors_function_url : "https://test-service-dee-4583.twil.io/check_counsellors"
          ab211fr_queue_sid : "WQfddc91935877bb3b8cc955746f7b0fea"

          #Recording URLs
          main_url : "https://test-service-dee-4583.twil.io/HCMain.mp3"
          en_function_url : "https://test-service-dee-4583.twil.io/6011_ab211_en"
          fr_function_url : "https://test-service-dee-4583.twil.io/6012_ab211_fr"
          en_tos_url : "https://test-service-dee-4583.twil.io/KHPENToS.mp3"
          fr_tos_url : "https://test-service-dee-4583.twil.io/KHPFRToS.mp3"
          en_privacy_url : "https://test-service-dee-4583.twil.io/KHPENPrivacy.mp3"
          fr_privacy_url : "https://test-service-dee-4583.twil.io/KHPFRPrivacy.mp3"
          en_invalid_url : "https://test-service-dee-4583.twil.io/EnInvalid.mp3"
          fr_invalid_url : "https://test-service-dee-4583.twil.io/FrInvalid.mp3"
          en_disconnect_url : "https://test-service-dee-4583.twil.io/EnDisconnect.mp3"
          fr_disconnect_url : "https://test-service-dee-4583.twil.io/FrDisconnect.mp3"
          en_intro_url : "https://test-service-dee-4583.twil.io/Msg10006E.mp3"
          fr_intro_url : "https://test-service-dee-4583.twil.io/MSG10006F.mp3"
          en_inflight_url : "https://test-service-dee-4583.twil.io/Msg60011E.mp3"
          fr_inflight_url : "https://test-service-dee-4583.twil.io/Msg60021.mp3"
          fr_issues_url : "https://test-service-dee-4583.twil.io/FrTechIssues.mp3"
          fr_nocounsellors_url : "https://test-service-dee-4583.twil.io/Msg60025.mp3"
          fr_switch_english_url : "https://test-service-dee-4583.twil.io/FrSwitchEnglish.mp3"
          fr_switch_url : "https://test-service-dee-4583.twil.io/FrSwitchInterpreter.mp3"
          frtr_function_url : "https://test-service-dee-4583.twil.io/6004_khp_french_int"
        }
        chatbot_unique_names = []
      },
      "988camh" : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/ca/templates/studio-flows/988camh.tftpl"
        channel_flow_vars = {
          en_number : "3656595751"
          fr_number : "3656011530"
          ns_fr_number : "7823120134"

          en_function_url : "https://test-service-dee-4583.twil.io/988_en"
          fr_function_url : "https://test-service-dee-4583.twil.io/988_fr"
        }
        chatbot_unique_names = []
      }
    }
    #Task router
    phone_numbers = {
      khp : ["+12048186655", "+18332030748"],
      g2ton : ["+18446052258", "+18559768844"],
      g2ttr : ["+18882913868", "+18559768844"],
      g2tns : ["+15814810744", "+15812215204"],
      ab211 : ["+13656495517"],
      training : ["+15878407089"],
      "988_camh" : ["+13656595751", "+13656011530"],
      "988_ns" : ["+17823120134"]
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
  }
}
