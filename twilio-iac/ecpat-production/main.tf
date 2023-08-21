terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/ph/terraform.tfstate"
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
  secrets                      = jsondecode(data.aws_ssm_parameter.secrets.value)
  helpline                     = "ECPAT"
  short_helpline               = "PH"
  operating_info_key           = "ph"
  environment                  = "Production"
  short_environment            = "PROD"
  target_task_name             = "greeting"
  twilio_numbers               = ["messenger:550013548423077"]
  channel                      = ""
  custom_channel_attributes    = ""
  operating_hours_function_sid = "ZH6a5fd13e2faf9d0ff507b3dbdec53612"
  twilio_channels = {
    "facebook" = { "contact_identity" = "messenger:550013548423077", "channel_type" = "facebook" }
  }

  custom_channels = []
  //serverless
  ui_editable = false
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source         = "../terraform-modules/chatbots/default"
  serverless_url = module.serverless.serverless_environment_production_url
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
  ui_editable        = local.ui_editable
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
  source                                = "../terraform-modules/taskRouter/ecpat_v2"
  serverless_url                        = module.serverless.serverless_environment_production_url
  helpline                              = local.helpline
  custom_task_routing_filter_expression = "isContactlessTask==true OR twilioNumber==\"messenger:550013548423077\""
}


module "twilioChannel" {
  for_each                 = local.twilio_channels
  source                   = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  channel_type             = each.value.channel_type
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/multiple-queues-ph/with-chatbot.tftpl",
    {
      channel_name                         = "${each.key}"
      serverless_url                       = module.serverless.serverless_environment_production_url
      serverless_service_sid               = module.serverless.serverless_service_sid
      serverless_environment_sid           = module.serverless.serverless_environment_production_sid
      master_workflow_sid                  = module.taskRouter.master_workflow_sid
      outside_operating_hours_workflow_sid = module.taskRouter.outside_operating_hours_workflow_sid
      non_counselling_workflow_sid         = module.taskRouter.non_counselling_workflow_sid
      chat_task_channel_sid                = module.taskRouter.chat_task_channel_sid
      language_bot_sid                     = twilio_autopilot_assistants_v1.languageBot_v2.sid
      permission_en_bot_sid                = twilio_autopilot_assistants_v1.permissionBot_en_v2.sid
      permission_fil_bot_sid               = twilio_autopilot_assistants_v1.permissionBot_fil_v2.sid
      presurvey_bot_en_sid                 = twilio_autopilot_assistants_v1.preSurvey_en_v2.sid
      presurvey_bot_fil_sid                = twilio_autopilot_assistants_v1.preSurvey_fil_v2.sid
      operating_hours_function_sid         = local.operating_hours_function_sid
      channel_attributes                   = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl", { task_language = "" })
      flow_description                     = "${title(each.key)} Messaging Flow"
  })
  target_task_name      = local.target_task_name
  channel_name          = each.key
  janitor_enabled       = true
  master_workflow_sid   = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module "survey" {
  source                             = "../terraform-modules/survey/default"
  helpline                           = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
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
  master_workflow_sid                = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = module.chatbots.post_survey_bot_sid
  survey_workflow_sid                = module.survey.survey_workflow_sid
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = local.short_environment
  short_helpline     = local.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}
