locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    
    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
    }

    #Task router 
    phone_numbers = {
      youthline : ["???"]
    }

    #Chatbots

    #Feature flags
    feature_flags = {
      enable_fullstory_monitoring : true
      enable_upload_documents : true
      enable_post_survey : false
      enable_contact_editing : true
      enable_case_management : true
      enable_offline_contact : true
      enable_filter_cases : true
      enable_sort_cases : true
      enable_transfers : true
      enable_manual_pulling : true
      enable_csam_report : false
      enable_canned_responses : true
      enable_dual_write : false
      enable_save_insights : false
      enable_previous_contacts : false
      enable_voice_recordings : false
      enable_twilio_transcripts : false
      enable_external_transcripts : true
      post_survey_serverless_handled : true
      enable_csam_clc_report : false
      enable_counselor_toolkits : true
      enable_resources : false
      enable_emoji_picker : true
    }

  }
}