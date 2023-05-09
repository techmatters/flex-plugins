locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    #Studio flow
    flow_vars = {
      service_sid = "ZS052e3d62a635572170cfbff86fb1ce1d"
      environment_sid = "ZEf8ce7107c3db8823a53edc59e628946f"
      time_cycle_function_sid = "ZH8551f80ce0f53ad437368a4c4bd91001"
      time_cycle_function_url = "https://twilio-service-4854.twil.io/time_cycle"
      engagement_function_sid = "ZH10286342f7b1a3952466a9d25eba5d1c"
      engagement_function_url = "https://twilio-service-4854.twil.io/engagement"
      check_queue_capacity_function_sid = "ZS052e3d62a635572170cfbff86fb1ce1d"
      check_queue_capacity_function_url = "https://twilio-service-4854.twil.io/check_queue_capacity"
      workspace_sid = "WSf2e3f00412fa8cc45f4318b45a870ea5"
      english_queue_sid = "WQf659c270357487d2372a657b649a3a7a"
      french_queue_sid = "WQ43733e6ff913f64edafb10b041804c6e"
    }

    #Channels
     channels = {
      webchat : {
        channel_type = "web"
        contact_identity = ""
        templatefile = "/app/twilio-iac/helplines/ca/templates/studio-flows/webchat.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names =[]
      }
    }
    phone_numbers = {
      khp : ["????"],
      g2t : ["????"],
    }

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
