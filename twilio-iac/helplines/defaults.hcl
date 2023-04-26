/**
 * default locals do not need to be nested in a local_config object because they
 * are the top level so never need to be merged together with other locals
 **/
locals {
  region                = "us-east-1"
  helpline_region       = "us-east-1"
  aws_monitoring_region = "us-east-1"

  multi_office       = false
  enable_post_survey = false
  target_task_name   = "greeting"
  twilio_numbers     = []
  channel            = ""

  channel_attributes = {
    webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
    twitter : "/app/twilio-iac/helplines/templates/channel-attributes/twitter.tftpl"
    default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
  }
  contacts_waiting_channels = ["voice","web","whatsapp","facebook","twitter","instagram","line"]

  enable_voice_channel = false

  channels = {}

  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"

  // TODO: these will probably move out of terraform and may not be correct.
  // Don't run apply for the configure stage until these are updated.
  feature_flags = {
    "enable_fullstory_monitoring" : true,
    "enable_external_transcripts" : true,
    "enable_upload_documents" : true,
    "enable_post_survey" : false,
    "enable_contact_editing" : true,
    "enable_case_management" : true,
    "enable_offline_contact" : true,
    "enable_filter_cases" : true,
    "enable_sort_cases" : true,
    "enable_transfers" : true,
    "enable_manual_pulling" : true,
    "enable_csam_report" : true,
    "enable_save_insights" : true,
    "enable_canned_responses" : true,
    "enable_emoji_picker" : true,
    "enable_dual_write" : false,
    "post_survey_serverless_handled" : true,
    "enable_previous_contacts" : true,
  }

  manage_github_secrets = true

  events_filter = [
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

  task_queues = {
    master : {
      friendly_name   = "Master"
      target_workders = "1"
      target_workers  = "1==1"
    },
    // survey : {
    //   friendly_name = "Survey"
    //   target_workders = "1"
    //   target_workers = "1==0"
    // },
  }

  workflows = {
    master : {
      friendly_name = "Master Workflow"
      templatefile  = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
    },
    // survey : {
    //   friendly_name = "Survey"
    //   templatefile  = "/app/twilio-iac/helplines/templates/workflows/survey.tftpl"
    // },
  }

  task_channels = {
    default : "Default"
    chat : "Programmable Chat"
    voice : "Voice"
    sms : "SMS"
    video : "Video"
    email : "Email"
    // survey : "Survey"
  }

  mock_outputs = {
    chatbot = {
      chatbot_languages_selector_sid = "chatbot_languages_selector_sid"
      chatbot_sids = {
        "en"         = "chatbot_sid_en"
        "pre_survey" = "pre_survey_bot_sid"
      }
    }

    provision = {
      serverless_url                        = "serverless_url"
      serverless_environment_production_sid = "serverless_environment_production_sid"
      serverless_service_sid                = "serverless_service_sid"
      task_router_master_workflow_sid       = "task_router_master_workflow_sid"
      task_router_chat_task_channel_sid     = "task_router_chat_task_channel_sid"
      task_router_voice_task_channel_sid    = "task_router_voice_task_channel_sid"
      services_flex_chat_service_sid        = "services_flex_chat_service_sid"
    }
  }
}