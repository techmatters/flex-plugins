locals {
  region = "us-east-1"
  helpline_region = "us-east-1"

  multi_office = false
  enable_post_survey = false
  target_task_name = "greeting"
  twilio_numbers = []
  channel = ""

  custom_channels = []

  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"

  feature_flags = {
    "enable_fullstory_monitoring": true,
    "enable_upload_documents": true,
    "enable_post_survey": false,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": false,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": true,
    "enable_previous_contacts": true,
    "enable_contact_editing": true,
    "enable_twilio_transcripts": true,
  }

  manage_github_secrets = true

  task_router_config = {
    event_filters = [
      "task.created",
      "task.canceled",
      "task.completed",
      "task.deleted",
      "task.wrapup",
      "task-queue.entered",
      "task.system-deleted",
      "reservation.accepted",
      "reservation.rejected",
      "reservation.timeout",
      "reservation.wrapup",
    ]

    additional_queues = []

    channels = [
      {
        friendly_name = "Default"
        unique_name   = "default"
      },
      {
        friendly_name = "Programmable Chat"
        unique_name   = "chat"
      },
      {
        friendly_name = "Voice"
        unique_name   = "voice"
      },
      {
        friendly_name = "SMS"
        unique_name   = "sms"
      },
      {
        friendly_name = "Video"
        unique_name   = "video"
      },
      {
        friendly_name = "Email"
        unique_name   = "email"
      }
    ]
  }
}