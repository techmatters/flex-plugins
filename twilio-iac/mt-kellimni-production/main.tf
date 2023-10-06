terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/mt/terraform.tfstate"
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
  secrets                   = jsondecode(data.aws_ssm_parameter.secrets.value)
  helpline                  = "Kellimni"
  short_helpline            = "MT"
  operating_info_key        = "mt"
  environment               = "Production"
  short_environment         = "PROD"
  target_task_name          = "greeting"
  task_language             = "en-US"
  twilio_numbers            = ["instagram:17841400289612325", "messenger:325981127456443", "whatsapp:+15077097720"]
  channel                   = ""
  custom_channel_attributes = ""
  twilio_channels = {
    "facebook" = { "contact_identity" = "messenger:325981127456443", "channel_type" = "facebook" },
    "webchat"  = { "contact_identity" = "", "channel_type" = "web" }
    "whatsapp" = { "contact_identity" = "whatsapp:+15077097720", "channel_type" = "whatsapp" }
  }

  custom_channels = [
    "instagram"
  ]
  enable_post_survey = false

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


  custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['instagram:17841400289612325', 'messenger:325981127456443', 'whatsapp:+15077097720']"
  workflows = {
    master : {
      friendly_name            = "Master Workflow"
      templatefile             = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      task_reservation_timeout = 600
    },
    survey : {
      friendly_name = "Survey Workflow"
      templatefile  = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
    }
  }

  task_queues = {
    master : {
      "target_workers" = "1==1",
      "friendly_name"  = "Kellimni"
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
    service_sid                           = "ZSdb37ba82eecdad41e21c71d1f2461052"
    environment_sid                       = "ZE93e3c9f4e1f94fb6e3ea97dc98b5129e"
    capture_channel_with_bot_function_sid = "ZH95285b8e20b443a167ada3db38b1ff99"
    chatbot_callback_cleanup_function_id  = "ZHe8f285fc47fc1150a87bb46a8eb467be"
    send_message_janitor_function_sid     = "ZH91ec531cde681192daf63e306db90d88"
  }

  channels = {
    webchat : {
      channel_type         = "web"
      contact_identity     = ""
      templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    facebook : {
      channel_type         = "facebook"
      contact_identity     = "messenger:325981127456443"
      templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    whatsapp : {
      channel_type         = "whatsapp"
      contact_identity     = "whatsapp:+15077097720"
      templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
      channel_flow_vars    = {}
      chatbot_unique_names = []
    },
    instagram : {
      channel_type         = "custom"
      contact_identity     = "instagram"
      templatefile         = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging-lex.tftpl"
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
  post_survey_bot_sid                = "post survey deleted"
  survey_workflow_sid                = module.taskRouter.workflow_sids["survey"]
  bucket_region                      = "eu-west-1"
  helpline_region                    = "eu-west-1"
}

provider "github" {
  owner = "techmatters"
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = local.short_environment
  short_helpline     = local.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}
