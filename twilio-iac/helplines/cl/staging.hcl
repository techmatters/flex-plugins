locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    slack_webhook_url = "https://hooks.slack.com/example"
    #Studio flow
    flow_vars = {
      service_sid                  = "ZSeed7070ce3f2974cb12a0382a2c93340"
      environment_sid              = "ZEe424f8b564e45c01958e48a1bdfdb41d"
      operating_hours_function_sid = "ZH3474ae11ae0fcd34edf418930a4abdaf"
      operating_hours_function_url = "https://serverless-2776-production.twil.io/operatingHours"
    }

    ui_editable = true
    #Chatbots

    #Feature flags
    feature_flags = {
      "enable_fullstory_monitoring" : true,
      "enable_upload_documents" : true,
      "enable_post_survey" : true,
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
      "enable_voice_recordings" : true,
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