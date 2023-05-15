terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/cl/terraform.tfstate"
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
  helpline                     = "Linea Libre"
  short_helpline               = "CL"
  operating_info_key           = "cl"
  environment                  = "Production"
  short_environment            = "PROD"
  definition_version           = "cl-v1"
  permission_config            = "cl"
  helpline_language            = "es-CL"
  task_language                = "es-CL"
  voice_ivr_language           = "es-MX"
  operating_hours_function_sid = "ZHb02706803df7458aebd679967beb1005"
  enable_post_survey           = true
  multi_office                 = false
  twilio_numbers               = [""]
  channel                      = ""
  custom_channel_attributes    = ""
  feature_flags = {
    "enable_fullstory_monitoring" : false,
    "enable_upload_documents" : true,
    "enable_post_survey" : local.enable_post_survey,
    "enable_contact_editing" : true,
    "enable_case_management" : true,
    "enable_offline_contact" : true,
    "enable_filter_cases" : true,
    "enable_sort_cases" : true,
    "enable_transfers" : true,
    "enable_manual_pulling" : false,
    "enable_csam_report" : false,
    "enable_canned_responses" : true,
    "enable_dual_write" : false,
    "enable_save_insights" : false,
    "enable_previous_contacts" : true,
    "enable_voice_recordings" : false,
    "enable_twilio_transcripts" : true,
    "enable_external_transcripts" : true,
    "post_survey_serverless_handled" : true,
    "enable_csam_clc_report" : false,
    "enable_counselor_toolkits" : false,
    "enable_resources" : false,
    "enable_emoji_picker" : true

  }
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  strings = jsondecode(file("${path.module}/../translations/${local.helpline_language}/strings.json"))
  twilio_channels = {
    "webchat" = { "contact_identity" = "", "channel_type" = "web" }
  }

  //serverless
  ui_editable = true

  contacts_waiting_channels = ["voice", "web"]

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
  task_channels = {
    default : "Default"
    chat : "Programmable Chat"
    voice : "Voice"
    sms : "SMS"
    video : "Video"
    email : "Email"
    survey : "Survey"
  }
  workflows = {
    master : {
      friendly_name : "Master Workflow"
      templatefile : "/app/twilio-iac/helplines/cl/templates/workflows/master.tftpl"
    },
    survey : {
      friendly_name : "Survey Workflow"
      templatefile : "/app/twilio-iac/helplines/templates/workflows/survey.tftpl"
    }
  }
  phone_numbers = {
    linea_libre : ["?"]
  }
  task_queues = {
    voice : {
      "target_workers" = "routing.skills HAS 'Calls'",
      "friendly_name"  = "Voice Calls"
    },
    messaging : {
      "target_workers" = "routing.skills HAS 'Messaging'",
      "friendly_name"  = "Messaging"
    },
    survey : {
      "target_workers" = "1==0",
      "friendly_name"  = "Survey"
    }

  }

  #Studio flow
  flow_vars = {
    service_sid                  = "ZSe84c8040f76f6e331310f132b88c25d8"
    environment_sid              = "ZE79c328112066b496d1875fe19bfe2b5c"
    operating_hours_function_sid = "ZHb02706803df7458aebd679967beb1005"
    operating_hours_function_url = "https://serverless-6342-production.twil.io/operatingHours"
  }
  channel_attributes = {
    webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
    twitter : "/app/twilio-iac/helplines/templates/channel-attributes/twitter.tftpl"
    voice : "/app/twilio-iac/helplines/templates/channel-attributes/voice.tftpl"
    default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
  }

  #Channels
  channels = {
    webchat : {
      channel_type     = "web"
      contact_identity = ""
      templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours.tftpl"
      channel_flow_vars = {
        chat_greeting_message = "¡Hola, te doy la bienvenida a Línea Libre! Este es un espacio seguro donde podemos conversar con tranquilidad y confianza. Estamos para escucharte, apoyarte y orientarte. Antes de conversar, nos gustaría contarte que trabajamos bajo el Principio de Protección, donde en caso que percibamos que tu integridad o la de un tercero pueda estar en riesgo, nuestro equipo tomará las medidas necesarias para asegurar tu protección y bienestar. Cuéntanos ¿tienes alguna duda sobre esto?"
        widget_from           = local.helpline
      }
      chatbot_unique_names = []
    },
    voice : {
      channel_type     = "voice"
      contact_identity = ""
      templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours.tftpl"
      channel_flow_vars = {
        voice_ivr_greeting_message = "Hola, estás comunicándote con Línea Libre, un canal que ofrece una primera atención psicológica, y que busca apoyarte y orientarte en lo que sea que estés pasando. Antes de conversar, nos gustaría contarte que trabajamos bajo el principio de protección. Si percibimos que tu integridad o la de un tercero puede estar en riesgo, haremos lo necesario para asegurar tu protección y bienestar. Por tu seguridad, esta llamada podría ser grabada."
        voice_ivr_language         = "es-MX"
      }
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

moved {
  from = module.taskRouter.twilio_taskrouter_workspaces_task_queues_v1.task_queue["master"]
  to   = module.taskRouter.twilio_taskrouter_workspaces_task_queues_v1.task_queue["messaging"]
}
module "taskRouter" {
  source         = "../terraform-modules/taskRouter/v1"
  serverless_url = module.serverless.serverless_environment_production_url
  helpline       = local.helpline
  events_filter  = local.events_filter
  task_queues    = local.task_queues
  workflows      = local.workflows
  task_channels  = local.task_channels
  phone_numbers  = local.phone_numbers
}

module "flex" {
  source                    = "../terraform-modules/flex/service-configuration"
  twilio_account_sid        = local.secrets.twilio_account_sid
  short_environment         = local.short_environment
  environment               = local.environment
  operating_info_key        = local.operating_info_key
  permission_config         = local.permission_config
  definition_version        = local.definition_version
  serverless_url            = module.serverless.serverless_environment_production_url
  multi_office_support      = local.multi_office
  feature_flags             = local.feature_flags
  helpline_language         = local.helpline_language
  contacts_waiting_channels = local.contacts_waiting_channels
}


module "channel" {
  source                = "../terraform-modules/channels/v1"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  workflow_sids         = module.taskRouter.workflow_sids
  task_channel_sids     = module.taskRouter.task_channel_sids
  channel_attributes    = local.channel_attributes
  channels              = local.channels
  enable_post_survey    = local.enable_post_survey
  flow_vars             = local.flow_vars
  short_environment     = local.short_environment
  task_language         = local.task_language
  short_helpline        = upper(local.short_helpline)
  slack_webhook_url   = local.slack_webhook_url
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
  post_survey_bot_sid                = "123"
  survey_workflow_sid                = module.taskRouter.workflow_sids["survey"]
}

module "aws_monitoring" {
  source         = "../terraform-modules/aws-monitoring/default"
  helpline       = local.helpline
  short_helpline = local.short_helpline
  environment    = local.environment
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = local.short_environment
  short_helpline     = local.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}
