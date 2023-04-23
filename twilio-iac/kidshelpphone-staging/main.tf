terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/ca/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-staging"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)




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

  phone_numbers = {
    khp : ["+15878407089"],
    g2t : ["+15814810744"]
  }

  workflows = {
    master : {
      friendly_name : "Master Workflow"
      templatefile : "/app/twilio-iac/helplines/ca/templates/workflows/master.tftpl"
    }
  }

  task_queues = {
    aggregate : {
      "target_workers" = "1==1",
      "friendly_name"  = "Aggregate"
    },

    khp_en : {
      "target_workers" = "routing.skills HAS 'KHP English'",
      "friendly_name"  = "KHP English"
    },
    khp_fr : { "target_workers" = "routing.skills HAS 'KHP French'",
      "friendly_name"           = "KHP French"
    },
    ab211_en : {
      "target_workers" = "routing.skills HAS 'AB211 English'",
      "friendly_name"  = "AB211 English"
    },
    ab211_fr : {
      "target_workers" = "routing.skills HAS 'AB211 French'",
      "friendly_name"  = "AB211 French"
    },
    g2t_ns_en : {
      "target_workers" = "routing.skills HAS 'Good2Talk NS English'",
      "friendly_name"  = "Good2Talk NS English"
    },
    g2t_ns_fr : {
      "target_workers" = "routing.skills HAS 'Good2Talk NS French'",
      "friendly_name"  = "Good2Talk NS French"
    },
    g2t_on_en : {
      "target_workers" = "routing.skills HAS 'Good2Talk ON English'",
      "friendly_name"  = "Good2Talk ON English"
    },
    g2t_on_fr : {
      "target_workers" = "routing.skills HAS 'Good2Talk ON French'",
      "friendly_name"  = "Good2Talk ON French"
    },
    g2t_on_zh : {
      "target_workers" = "routing.skills HAS 'Good2Talk ON Mandarin'",
      "friendly_name"  = "Good2Talk ON Mandarin"
    },
    interpreter_en : {
      "target_workers" = "routing.skills HAS 'Interpreter' ",
      "friendly_name"  = "Interpreter"
    },
    interpreter_fr : {
      "target_workers" = "routing.skills HAS 'French Interpreter'",
      "friendly_name"  = "French Interpreter"
    },
    supervisor : {
      "target_workers" = "routing.skills HAS 'Supervisor'",
      "friendly_name"  = "Supervisor"
    },
    training : {
      "target_workers" = "routing.skills HAS 'Training'",
      "friendly_name"  = "Training"
    },
    health_canada_en : {
      "target_workers" = "routing.skills HAS 'Health Canada English'",
      "friendly_name"  = "Health Canada English"
    },
    health_canada_fr : {
      "target_workers" = "routing.skills HAS 'Health Canada French'",
      "friendly_name"  = "Health Canada French"
    },
    chat_en : {
      "target_workers" = "routing.skills HAS 'Chat English'",
      "friendly_name"  = "Chat English"
    },
    chat_fr : {
      "target_workers" = "routing.skills HAS 'Chat French'",
      "friendly_name"  = "Chat French"
    },
    indigenous : {
      "target_workers" = "routing.skills HAS 'Indigenous [Interpreter]'",
      "friendly_name"  = "Indigenous [Interpreter]"
    }
  }

  task_channels = {
    default : "Default"
    chat : "Programmable Chat"
    voice : "Voice"
    sms : "SMS"
    video : "Video"
    email : "Email"
    //survey : "Survey"
  }

  helpline             = "Kids Help Phone"
  short_helpline       = "CA"
  environment          = "Staging"
  short_environment    = "STG"
  operating_info_key   = "ca"
  permission_config    = "zm"
  definition_version   = "ca-v1"
  multi_office_support = false
  task_language        = "en-CA"
  helpline_language    = "en-CA"

  feature_flags = {
    "enable_fullstory_monitoring" = false
    "enable_upload_documents"     = true
    "enable_previous_contacts"    = true
    "enable_case_management"      = true
    "enable_offline_contact"      = true
    "enable_transfers"            = true
    "enable_manual_pulling"       = true
    "enable_csam_report"          = false
    "enable_canned_responses"     = true
    "enable_dual_write"           = false
    "enable_save_insights"        = true
    "enable_post_survey"          = false
  }


  enable_post_survey = false
  //common across all helplines
  channel_attributes = {
    webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
    twitter : "/app/twilio-iac/helplines/templates/channel-attributes/twitter.tftpl"
    default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
  }
  flow_vars = {
    service_sid : "ZSb631f562c8306085ceb8329349fdd60b"
    environment_sid : "ZEd72a0800eb472d514e48977ffab9b642"
    time_cycle_function_sid : "ZH3ee5654cb3c8cda06c2aaf84593b11a6"
    time_cycle_function_url : "https://test-service-dee-4583.twil.io/time_cycle"
    engagement_function_sid : "ZH946d079ec6be9b1b899a6cf30be0660f"
    engagement_function_url : "https://test-service-dee-4583.twil.io/engagement"
  }
  channels = {
    webchat : {
      channel_type : "web"
      contact_identity : ""
      templatefile : "/app/twilio-iac/helplines/ca/templates/studio-flows/webchat.tftpl"
      channel_flow_vars : {}
    }
  }


}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "hrmServiceIntegration" {
  source            = "../terraform-modules/hrmServiceIntegration/default"
  local_os          = var.local_os
  helpline          = local.helpline
  short_helpline    = local.short_helpline
  environment       = local.environment
  short_environment = local.short_environment
}

module "serverless" {
  source             = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source                    = "../terraform-modules/services/default"
  local_os                  = var.local_os
  helpline                  = local.helpline
  short_helpline            = local.short_helpline
  environment               = local.environment
  short_environment         = local.short_environment
  uses_conversation_service = false
}

module "taskRouter" {
  source         = "../terraform-modules/taskRouter/v1"
  serverless_url = module.serverless.serverless_environment_production_url
  events_filter  = local.events_filter
  task_queues    = local.task_queues
  workflows      = local.workflows
  task_channels  = local.task_channels
  phone_numbers  = local.phone_numbers
}


module "channel" {

  source                = "../terraform-modules/channels/v1"
  workflow_sids         = module.taskRouter.workflow_sids
  task_channel_sids     = module.taskRouter.task_channel_sids
  channel_attributes    = local.channel_attributes
  channels              = local.channels
  enable_post_survey    = local.enable_post_survey
  flex_chat_service_sid = module.services.flex_chat_service_sid
  task_language         = local.task_language
  flow_vars             = local.flow_vars
  short_environment     = local.short_environment
  short_helpline        = local.short_helpline
}



module "flex" {
  source               = "../terraform-modules/flex/service-configuration"
  twilio_account_sid   = local.secrets.twilio_account_sid
  short_environment    = local.short_environment
  operating_info_key   = local.operating_info_key
  permission_config    = local.permission_config
  definition_version   = local.definition_version
  serverless_url       = module.serverless.serverless_environment_production_url
  multi_office_support = local.multi_office_support
  feature_flags        = local.feature_flags
  helpline_language    = local.helpline_language
}

module "survey" {
  source                                = "../terraform-modules/survey/default"
  helpline                              = local.helpline
  flex_task_assignment_workspace_sid    = module.taskRouter.flex_task_assignment_workspace_sid
  custom_task_routing_filter_expression = "isSurveyTask==true"
}

module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = local.helpline
  short_helpline                     = local.short_helpline
  environment                        = local.environment
  short_environment                  = local.short_environment
  operating_info_key                 = local.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.workflow_sids["master"]
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = "UAa1b1e9b74a9b36c37b8c794827fcaf87"
  survey_workflow_sid                = module.survey.survey_workflow_sid
}
