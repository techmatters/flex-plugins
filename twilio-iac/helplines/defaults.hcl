/**
 * default locals do not need to be nested in a local_config object because they
 * are the top level so never need to be merged together with other locals
 **/
locals {
  region                = "us-east-1"
  helpline_region       = "us-east-1"
  aws_monitoring_region = "us-east-1"

  enable_post_survey = false
  target_task_name   = "greeting"
  twilio_numbers     = []
  channel            = ""

  enable_external_recordings = false

  channel_attributes = {
    webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
    voice : "/app/twilio-iac/helplines/templates/channel-attributes/voice.tftpl"
    default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
    default-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/default-conversations.tftpl"
    line-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/line-conversations.tftpl"
    telegram-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/telegram-conversations.tftpl"
    instagram-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/instagram-conversations.tftpl"
  }
  contacts_waiting_channels = ["voice", "web", "whatsapp", "facebook", "twitter", "instagram", "line"]

  enable_voice_channel = false

  channels = {}

  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"

  lex_bot_languages = {}

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
    e2e_test : {
      "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
      "friendly_name"  = "E2E Test Queue"
    }
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
    survey : "Survey"
  }

  s3_lifecycle_rules = {
    hrm_export_expiry : {
      id                 = "HRM Exported Data Expiration Rule"
      expiration_in_days = 30
      prefix             = "hrm-data/"
    }
  }
  
  subscription = {
    event  = "com.twilio.studio.flow.execution.started"
  }
  additional_events = [
      "com.twilio.studio.flow.execution.ended",
      "com.twilio.studio.flow.step.ended",
      "com.twilio.taskrouter.reservation.created",
      "com.twilio.taskrouter.reservation.accepted",
      "com.twilio.taskrouter.reservation.rejected"
      ]	


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