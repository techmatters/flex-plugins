locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline       = "Kellimni"
    old_dir_prefix = "mt-kellimni"

    helpline_region = "eu-west-1"

    definition_version = "mt-v1"
    helpline_language  = "en-MT"

    feature_flags = {
      "enable_fullstory_monitoring" : true,
      "enable_upload_documents" : true,
      "enable_post_survey" : false,
      "enable_case_management" : true,
      "enable_offline_contact" : true,
      "enable_filter_cases" : true,
      "enable_sort_cases" : true,
      "enable_transfers" : true,
      "enable_manual_pulling" : true,
      "enable_csam_report" : false,
      "enable_canned_responses" : true,
      "enable_dual_write" : false,
      "enable_save_insights" : true,
      "enable_previous_contacts" : true,
      "enable_contact_editing" : true,
      "enable_twilio_transcripts" : true,
      "enable_aselo_messaging_ui" : true
    }

    strings_en  = jsondecode(file("../../translations/en-MT/strings.json"))
    strings_mt  = jsondecode(file("../../translations/mt-MT/strings.json"))
    strings_ukr = jsondecode(file("../../translations/ukr-MT/strings.json"))
  }
}