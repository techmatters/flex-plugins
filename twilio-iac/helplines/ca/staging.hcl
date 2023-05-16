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
      operating_hours_function_sid      = "ZHc3676ca6ff87edc2b4b4c9d2a4b22c82"
      operating_hours_function_url      = "https://serverless-8126-dev.twil.io/operatingHours"
    }

    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/ca/templates/studio-flows/webchat.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    #Task router 
    phone_numbers = {
      khp : ["+15878407089"],
      g2t : ["+15814810744"]
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
    }

  }
}
