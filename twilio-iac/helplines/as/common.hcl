locals {
  helpline = "Aselo"
  old_dir_prefix = "aselo-as"

  definition_version = "demo-v1"
  helpline_language = "en-MT"

  twilio_channels = {
    "webchat" = {"contact_identity" = "", "channel_type" ="web"  }
  }

  feature_flags = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": false,
    "enable_contact_editing": true,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": false,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": false,
    "enable_previous_contacts": true,
    "enable_voice_recordings": false,
    "enable_twilio_transcripts": true,
    "enable_external_transcripts": false,
    "post_survey_serverless_handled": true,
    "enable_csam_clc_report": false
  }
}