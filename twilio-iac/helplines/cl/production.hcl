locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    slack_webhook_url = "https://hooks.slack.com/example"
    #Studio flow
    flow_vars = {
      service_sid                  = "ZSe84c8040f76f6e331310f132b88c25d8"
      environment_sid              = "ZE79c328112066b496d1875fe19bfe2b5c"
      operating_hours_function_sid = "ZHb02706803df7458aebd679967beb1005"
      operating_hours_function_url = "https://serverless-6342-production.twil.io/operatingHours"
    }

    
    #Chatbots

    #Feature flags
    feature_flags = {
      "enable_fullstory_monitoring" : true,
      "enable_upload_documents" : true,
      "enable_post_survey" : local.enable_post_survey,
      "enable_contact_editing" : true,
      "enable_case_management" : true,
      "enable_offline_contact" : true,
      "enable_filter_cases" : true,
      "enable_sort_cases" : true,
      "enable_transfers" : true,
      "enable_manual_pulling" : false,
      "enable_csam_report" : false,
      "enable_canned_responses" : true,
      "enable_dual_write" : false,
      "enable_save_insights" : false,
      "enable_previous_contacts" : true,
      "enable_voice_recordings" : false,
      "enable_twilio_transcripts" : true,
      "enable_external_transcripts" : true,
      "post_survey_serverless_handled" : true,
      "enable_csam_clc_report" : false,
      "enable_counselor_toolkits" : false,
      "enable_resources" : false,
      "enable_emoji_picker" : true,
      "enable_aselo_messaging_ui" : true
    }
  }
}