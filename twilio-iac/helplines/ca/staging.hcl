locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    resources_base_url = "https://hrm-staging.tl.techmatters.org"

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
          en_number: "8446052258"
          fr_number: "8559768844"
          tr_number: "8882913868"

          #Twilio things
          checkcounsellors_function_sid: "ZHa0218fd2a7b2e3aa800ab78e0367acf7"
          checkcounsellors_function_url: "https://test-service-dee-4583.twil.io/check_counsellors"
          g2tonen_queue_sid: ""
          g2tonfr_queue_sid: "WQ35e4fceff9d82cc1d9ce2a49a1c93330"
          g2ttr_queue_sid: "WQ8351ee438539d776c083c4286f51bad9"

          #Recording URLs
          en_function_url: "https://test-service-dee-4583.twil.io/6013_g2ton_english"
          fr_function_url: "https://test-service-dee-4583.twil.io/6014_g2ton_french"
          tr_function_url: "https://test-service-dee-4583.twil.io/6019_g2t_interpreter"
          en_tos_url: "https://test-service-dee-4583.twil.io/G2TENToS.mp3"
          fr_tos_url: "https://test-service-dee-4583.twil.io/G2TFRToS.mp3"
          en_privacy_url: "https://test-service-dee-4583.twil.io/G2TEnPrivacy.mp3"
          fr_privacy_url: "https://test-service-dee-4583.twil.io/G2TFrPrivacy.mp3"
          en_invalid_url: "https://test-service-dee-4583.twil.io/EnInvalid.mp3"
          fr_invalid_url: "https://test-service-dee-4583.twil.io/FrInvalid.mp3"
          en_disconnect_url: "https://test-service-dee-4583.twil.io/EnDisconnect.mp3"
          fr_disconnect_url: "https://test-service-dee-4583.twil.io/FrDisconnect.mp3"
          en_intro_url: "https://test-service-dee-4583.twil.io/Msg10006G2TONEn.mp3"
          fr_intro_url: "https://test-service-dee-4583.twil.io/Msg10006G2TFr.mp3"
          tr_intro_url: "https://test-service-dee-4583.twil.io/Msg10006G2TTr.mp3"
          en_inflight_url: "https://test-service-dee-4583.twil.io/Msg60011E.mp3"
          fr_inflight_url: "https://test-service-dee-4583.twil.io/Msg60021.mp3"
          fr_nocounsellors_url: "https://test-service-dee-4583.twil.io/Msg60025.mp3"
          fr_issues_url: "https://test-service-dee-4583.twil.io/FrTechIssuesmp3"
          fr_switch_url: "https://test-service-dee-4583.twil.io/FrSwitchInterpreter.mp3"
          cyara_url: "https://test-service-dee-4583.twil.io/cyara-vq-testaudio.wav"

        }
        chatbot_unique_names = []
      }
    }
    #Task router 
    phone_numbers = {
      khp : ["+15878407089"],
      g2t : ["+15812215204", "+15814810744", "+12264070015", "+18446052258", "+18882913868", "+18559768844"]
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Chatbots

    #Feature flags
    feature_flags = {
      enable_fullstory_monitoring : true
      enable_upload_documents : false
      enable_post_survey : false
      enable_contact_editing : true
      enable_case_management : true
      enable_offline_contact : true
      enable_filter_cases : true
      enable_sort_cases : true
      enable_transfers : true
      enable_manual_pulling : false
      enable_csam_report : false
      enable_canned_responses : true
      enable_dual_write : false
      enable_save_insights : true
      enable_previous_contacts : false
      enable_voice_recordings : true
      enable_twilio_transcripts : false
      enable_external_transcripts : true
      post_survey_serverless_handled : true
      enable_csam_clc_report : false
      enable_counselor_toolkits : true
      enable_resources : true
      enable_emoji_picker : true
      enable_aselo_messaging_ui : true
    }

  }
}
