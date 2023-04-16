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

  workflows = [
    {
      name          = "master"
      friendly_name = "Master Workflow"
      templatefile  = "/app/twilio-iac/helplines/ca/templates/master-workflow.tftpl"
    }
  ]

  task_queues = [
    {
      "name"           = "aggregate",
      "target_workers" = "1==1",
      "friendly_name"  = "Aggregate"
    },
    {
      "name"           = "khp_en",
      "target_workers" = "routing.skills HAS 'KHP English'",
      "friendly_name"  = "KHP English"
    },
    {
      "name"           = "survey",
      "target_workers" = "1==0",
      "friendly_name"  = "Survey"
    },
    {
      "name"           = "khp_fr",
      "target_workers" = "routing.skills HAS 'KHP French'",
      "friendly_name"  = "KHP French"
    },
    {
      "name"           = "ab211_en",
      "target_workers" = "routing.skills HAS 'AB211 English'",
      "friendly_name"  = "AB211 English"
    },
    {
      "name"           = "ab211_fr",
      "target_workers" = "routing.skills HAS 'AB211 French'",
      "friendly_name"  = "AB211 French"
    },
    {
      "name"           = "g2t_ns_en",
      "target_workers" = "routing.skills HAS 'Good2Talk NS English'",
      "friendly_name"  = "Good2Talk NS English"
    },
    {
      "name"           = "g2t_ns_fr",
      "target_workers" = "routing.skills HAS 'Good2Talk NS French'",
      "friendly_name"  = "Good2Talk NS French"
    },
    {
      "name"           = "g2t_on_en",
      "target_workers" = "routing.skills HAS 'Good2Talk ON English'",
      "friendly_name"  = "Good2Talk ON English"
    },
    {
      "name"           = "g2t_on_fr",
      "target_workers" = "routing.skills HAS 'Good2Talk ON French'",
      "friendly_name"  = "Good2Talk ON French"
    },
    {
      "name"           = "g2t_on_zh",
      "target_workers" = "routing.skills HAS 'Good2Talk ON Mandarin'",
      "friendly_name"  = "Good2Talk ON Mandarin"
    },
    {
      "name"           = "interpreter_en",
      "target_workers" = "routing.skills HAS 'Interpreter' ",
      "friendly_name"  = "Interpreter"
    },
    {
      "name"           = "interpreter_fr",
      "target_workers" = "routing.skills HAS 'French Interpreter'",
      "friendly_name"  = "French Interpreter"
    },
    {
      "name"           = "supervisor",
      "target_workers" = "routing.skills HAS 'Supervisor'",
      "friendly_name"  = "Supervisor"
    },
    {
      "name"           = "training",
      "target_workers" = "routing.skills HAS 'Training'",
      "friendly_name"  = "Training"
    },
    {
      "name"           = "health_canada_en",
      "target_workers" = "routing.skills HAS 'Health Canada English'",
      "friendly_name"  = "Health Canada English"
    },
    {
      "name"           = "health_canada_fr",
      "target_workers" = "routing.skills HAS 'Health Canada French'",
      "friendly_name"  = "Health Canada French"
    },
    {
      "name"           = "chat_en",
      "target_workers" = "routing.skills HAS 'Chat English'",
      "friendly_name"  = "Chat English"
    },
    {
      "name"           = "chat_fr",
      "target_workers" = "routing.skills HAS 'Chat French'",
      "friendly_name"  = "Chat French"
    },
    {
      "name"           = "indigenous",
      "target_workers" = "routing.skills HAS 'Indigenous [Interpreter]'",
      "friendly_name"  = "Indigenous [Interpreter]"
    }
  ]


  task_channels = [
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
    },
    {
      friendly_name = "Survey"
      unique_name   = "survey"
    }
  ]


}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "hrmServiceIntegration" {
  source            = "../terraform-modules/hrmServiceIntegration/default"
  local_os          = var.local_os
  helpline          = var.helpline
  short_helpline    = var.short_helpline
  environment       = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source             = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source                    = "../terraform-modules/services/default"
  local_os                  = var.local_os
  helpline                  = var.helpline
  short_helpline            = var.short_helpline
  environment               = var.environment
  short_environment         = var.short_environment
  uses_conversation_service = false
}

module "taskRouter" {
  source         = "../terraform-modules/taskRouter/v1"
  serverless_url = module.serverless.serverless_environment_production_url
  events_filter  = local.events_filter
  task_queues    = local.task_queues
  workflows      = local.workflows
  task_channels  = local.task_channels
}

module "studioFlow" {
  source                   = "../terraform-modules/studioFlow/default"
  master_workflow_sid      = module.taskRouter.workflow_ids["master"]
  chat_task_channel_sid    = module.taskRouter.task_channel_ids["chat"]
  default_task_channel_sid = module.taskRouter.task_channel_ids["default"]
  pre_survey_bot_sid       = "UA1c64297b2953092b4ae9f0db543f3b25"

}

module "flex" {
  source                    = "../terraform-modules/flex/default"
  twilio_account_sid        = local.secrets.twilio_account_sid
  short_environment         = var.short_environment
  operating_info_key        = var.operating_info_key
  definition_version        = var.definition_version
  serverless_url            = module.serverless.serverless_environment_production_url
  permission_config         = "zm"
  multi_office_support      = var.multi_office
  feature_flags             = var.feature_flags
  flex_chat_service_sid     = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module "survey" {
  source                                = "../terraform-modules/survey/default"
  helpline                              = var.helpline
  flex_task_assignment_workspace_sid    = module.taskRouter.flex_task_assignment_workspace_sid
  custom_task_routing_filter_expression = "isSurveyTask==true"
}

module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = var.helpline
  short_helpline                     = var.short_helpline
  environment                        = var.environment
  short_environment                  = var.short_environment
  operating_info_key                 = var.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.workflow_ids["master"]
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = "UAa1b1e9b74a9b36c37b8c794827fcaf87"
  survey_workflow_sid                = module.survey.survey_workflow_sid
}
