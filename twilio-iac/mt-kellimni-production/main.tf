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
  twilio_numbers            = ["instagram:17841400289612325", "messenger:325981127456443", "whatsapp:+15077097722"]
  channel                   = ""
  custom_channel_attributes = ""
  twilio_channels = {
    "facebook" = { "contact_identity" = "messenger:325981127456443", "channel_type" = "facebook" },
    "webchat"  = { "contact_identity" = "", "channel_type" = "web" }
    "whatsapp" = { "contact_identity" = "whatsapp:+15077097722", "channel_type" = "whatsapp" }
  }

  custom_channels = [
    "instagram"
  ]
  strings_en  = jsondecode(file("${path.module}/../translations/en-MT/strings.json"))
  strings_mt  = jsondecode(file("${path.module}/../translations/mt-MT/strings.json"))
  strings_ukr = jsondecode(file("${path.module}/../translations/ukr-MT/strings.json"))
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
  source                                = "../terraform-modules/taskRouter/default"
  serverless_url                        = module.serverless.serverless_environment_production_url
  helpline                              = local.helpline
  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"
}

module "twilioChannel" {
  for_each                 = local.twilio_channels
  source                   = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  channel_type             = each.value.channel_type
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/language-mt/with-chatbot.tftpl",
    {
      channel_name                  = "${each.key}"
      serverless_url                = module.serverless.serverless_environment_production_url
      serverless_service_sid        = module.serverless.serverless_service_sid
      serverless_environment_sid    = module.serverless.serverless_environment_production_sid
      master_workflow_sid           = module.taskRouter.master_workflow_sid
      chat_task_channel_sid         = module.taskRouter.chat_task_channel_sid
      chatbot_en_sid                = twilio_autopilot_assistants_v1.chatbot_en.sid
      chatbot_mt_sid                = twilio_autopilot_assistants_v1.chatbot_mt.sid
      chatbot_ukr_sid               = twilio_autopilot_assistants_v1.chatbot_ukr.sid
      chatbot_language_selector_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
      channel_attributes_EN         = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl", { chatbot_language = "chatbot_EN" })
      channel_attributes_MT         = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl", { chatbot_language = "chatbot_MT" })
      channel_attributes_UKR        = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl", { chatbot_language = "chatbot_UKR" })
      flow_description              = "${title(each.key)} Messaging Flow"
  })
  target_task_name      = local.target_task_name
  channel_name          = each.key
  janitor_enabled       = true
  master_workflow_sid   = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module "customChannel" {
  for_each              = toset(local.custom_channels)
  source                = "../terraform-modules/channels/custom-channel"
  channel_name          = each.key
  janitor_enabled       = true
  master_workflow_sid   = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline        = local.short_helpline
  short_environment     = local.short_environment
  task_language         = "en-MT"
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
  environment                        = local.environment
  short_environment                  = local.short_environment
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
  bucket_region                      = "eu-west-1"
  helpline_region                    = "eu-west-1"
}
module "aws_monitoring" {
  source            = "../terraform-modules/aws-monitoring/default"
  helpline          = local.helpline
  short_helpline    = local.short_helpline
  environment       = local.environment
  cloudwatch_region = "us-east-1"
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
