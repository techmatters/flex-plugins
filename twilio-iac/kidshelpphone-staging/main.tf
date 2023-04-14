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
  name     = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
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

  task_queues = [
    { 
      "friendly_name" = "KHP English",
      "target_workers" = "routing.skills HAS 'KHP English'"
    }
  ]
  workflows = [
    {
       "friendly_name" = "Master Workflow",
       "filters" = [{
                    expression           = "(to==\"+15878407089\" AND language CONTAINS \"en-CA\") OR isContactlessTask == true"
                    filter_friendly_name = "KHP English"
                    targets              = [
                            {
                            expression = "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)"
                            queue      = "KHP English"
                            }
                      ]
                    }]

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
  source = "../terraform-modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  uses_conversation_service = false
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/module"
  event_callback_url ="${module.serverless.serverless_environment_production_url}/webhooks/taskrouterCallback"
  events_filter = local.events_filter
  task_queues = local.task_queues
  workflows = local.workflows
  task_channels = local.task_channels
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.workflow_id["Master Workflow"]
  chat_task_channel_sid = module.taskRouter.task_channel_id["Chat"]
  default_task_channel_sid = module.taskRouter.task_channel_id["Default"]
  pre_survey_bot_sid = "UA1c64297b2953092b4ae9f0db543f3b25"

}

module flex {
  source = "../terraform-modules/flex/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  definition_version = var.definition_version
  serverless_url = module.serverless.serverless_environment_production_url
  permission_config = "zm"
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  custom_task_routing_filter_expression = "isSurveyTask==true"
}

module aws {
  source = "../terraform-modules/aws/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  datadog_app_id = local.secrets.datadog_app_id
  datadog_access_token = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.workflow_id["Master Workflow"]
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = "UAa1b1e9b74a9b36c37b8c794827fcaf87"
  survey_workflow_sid = module.survey.survey_workflow_sid
}