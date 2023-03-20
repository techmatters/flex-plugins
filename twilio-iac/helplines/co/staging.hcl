locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = ["messenger:103574689075106","twitter:1540032139563073538","instagram:17841454586132629","whatsapp:+12135834846"]
  enable_post_survey = false


  local_config = {
    twilio_numbers = local.twilio_numbers

    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}] OR to IN [\"+17752526377\",\"+578005190671\"]"

    twilio_channels = {
      "facebook" = {"contact_identity" = "messenger:103574689075106", "channel_type" ="facebook" },
      "webchat" = {"contact_identity" = "", "channel_type" ="web"  },
      "whatsapp" = {"contact_identity" = "whatsapp:+12135834846", "channel_type" ="whatsapp" }
    }

    enable_post_survey = local.enable_post_survey
    feature_flags = {
      "enable_fullstory_monitoring": false,
      "enable_upload_documents": true,
      "enable_post_survey": local.enable_post_survey,
      "enable_case_management": true,
      "enable_offline_contact": true,
      "enable_filter_cases": true,
      "enable_sort_cases": true,
      "enable_transfers": true,
      "enable_manual_pulling": true,
      "enable_csam_report": true,
      "enable_canned_responses": true,
      "enable_dual_write": false,
      "enable_save_insights": true,
      "enable_previous_contacts": true,
      "enable_contact_editing": true
    }
  }
}