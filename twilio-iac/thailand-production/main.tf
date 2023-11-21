terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/th/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-production"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(local.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  helpline                  = "Childline Thailand"
  task_language             = "th-TH"
  short_helpline            = "TH"
  operating_info_key        = "th"
  environment               = "Production"
  short_environment         = "PROD"
  twilio_numbers            = ["messenger:59591583805", "twitter:1154628838472597505", "instagram:59591583805", "line:U65333e6b8ca9e96e41252ecb27c44cf9"]
  channel                   = ""
  custom_channel_attributes = ""
  enable_post_survey = false

  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  //Channels [Facebook | Line | Instagram | Twitter]
  twilio_channels = { "facebook" = { "contact_identity" = "messenger:59591583805", "channel_type" = "facebook" } }
  //
  custom_channels  = ["twitter", "instagram", "line"]
  target_task_name = "execute_initial_flow"
  strings_en       = jsondecode(file("${path.module}/../translations/en-TH/strings.json"))
  strings_th       = jsondecode(file("${path.module}/../translations/th-TH/strings.json"))


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


  custom_task_routing_filter_expression = "channelType IN ['web','instagram','line']  OR isContactlessTask == true OR  twilioNumber IN ['messenger:59591583805', 'twitter:1154628838472597505', 'instagram:59591583805', 'line:U65333e6b8ca9e96e41252ecb27c44cf9']"


  workflows = {
    master : {
      friendly_name : "Master Workflow"
      templatefile : "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      task_reservation_timeout = 180
    },
    survey : {
      friendly_name : "Survey Workflow"
      templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
    }
  }


  task_queues = {
    master : {
      "target_workers" = "1==1",
      "friendly_name"  = "Childline Thailand"
    },
    survey : {
      "target_workers" = "1==0",
      "friendly_name"  = "Survey"
    },
    e2e_test : {
      "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
      "friendly_name"  = "E2E Test Queue"
    }
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


  //common across all helplines
  channel_attributes = {
    webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
    voice : "/app/twilio-iac/helplines/templates/channel-attributes/voice.tftpl"
    twitter : "/app/twilio-iac/helplines/templates/channel-attributes/twitter.tftpl"
    default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
  }
  flow_vars = {
    service_sid                  = "ZS6afa8bf5e4d982ddeab17b7e0dba9977"
    environment_sid              = "ZE9c5728dc8ad714c6c26ba90fddf41bc1"
    operating_hours_function_sid = "ZH5147ef61e945cf01b85804663b481a58"

  }

  channels = {
    webchat : {
      channel_type         = "web"
      contact_identity     = ""
      templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    facebook : {
      channel_type         = "facebook"
      contact_identity     = "messenger:59591583805"
      templatefile         = "/app/twilio-iac/helplines/th/templates/studio-flows/facebook-flow.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    instagram : {
      channel_type         = "custom"
      contact_identity     = ""
      templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    line : {
      channel_type         = "custom"
      contact_identity     = ""
      templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
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
  source            = "../terraform-modules/services/default"
  local_os          = var.local_os
  helpline          = local.helpline
  short_helpline    = local.short_helpline
  environment       = local.environment
  short_environment = local.short_environment
}

module "taskRouter" {
  source                                = "../terraform-modules/taskRouter/v1"
  serverless_url                        = module.serverless.serverless_environment_production_url
  events_filter                         = local.events_filter
  task_queues                           = local.task_queues
  workflows                             = local.workflows
  task_channels                         = local.task_channels
  custom_task_routing_filter_expression = local.custom_task_routing_filter_expression
  helpline                              = local.helpline

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
  environment           = local.environment
  serverless_url        = module.serverless.serverless_environment_production_url

}
module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = local.helpline
  short_helpline                     = local.short_helpline
  short_environment                  = local.short_environment
  environment                        = local.environment
  operating_info_key                 = local.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.workflow_sids["master"]
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = "deleted"
  survey_workflow_sid                = module.taskRouter.workflow_sids["survey"]
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = local.short_environment
  short_helpline     = local.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}
