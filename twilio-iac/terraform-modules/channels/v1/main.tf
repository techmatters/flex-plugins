terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

data "aws_ssm_parameter" "webhook_url_studio_errors" {
  name = "/${lower(var.environment)}/slack/webhook_url_studio_errors"
}

locals {
  #Marking this as non sensitive since we need to see the studio flow definition when running a plan to validate changes.
  webhook_url_studio_errors = nonsensitive(data.aws_ssm_parameter.webhook_url_studio_errors.value)
  custom_lambda_channels = {for key, val in var.channels:
  key => val if val.lambda_channel == true}

  get_profile_flags_for_identifiers_base_url = var.get_profile_flags_for_identifiers_base_url == "" ? var.get_profile_flags_for_identifiers_base_url : var.serverless_url
}

#I'm not sure about this resource, the idea is to have 1 studio flow json template and also as few as possible
#channel attribute templates.

#var.flow_vars would be a dynamic map with all variables needed that are set in the configuration layer and common to every channel
#(channel_flow_vars would be specific to the channel), like function sids (created outside terraform)
#or other variables specific to the helpline or template being used.

#var.chatbots should be a map with all the chatbots objects (not just the sid, for amazon lex we might need a webhook or something), this should be the ouput of the chatbot module,
#so this module should be called after the creation of chatbots. The studio flow template will usually need the chatbot sids or identifier to call them.

#I'm not sure about the "channel_attributes =" section, channel_attributes will be different depending on the channel and chatbots used.
#The chatbots are needed to save their memory inside the channel attributes. A default channel attribute with no chatbots will usually require only the task_language


resource "twilio_studio_flows_v2" "channel_studio_flow" {
  for_each      = var.channels
  friendly_name = "${title(replace(each.key, "_", " "))} Studio Flow"
  status        = "published"
  definition = templatefile(
    each.value.templatefile,
    {
      flow_description                           = "${title(replace(each.key, "_", " "))} Studio Flow",
      channel_name                               = each.key,
      helpline                                   = var.helpline,
      task_language                              = var.task_language,
      flow_vars                                  = var.flow_vars,
      serverless_service_sid                     = var.serverless_service_sid,
      serverless_environment_sid                 = var.serverless_environment_sid,
      serverless_url                             = var.serverless_url,
      get_profile_flags_for_identifiers_base_url = local.get_profile_flags_for_identifiers_base_url,
      channel_flow_vars                          = each.value.channel_flow_vars,
      channel_chatbots = {
        for chatbot_name in each.value.chatbot_unique_names :
        chatbot_name => var.chatbots[chatbot_name]
      }
      workflow_sids                              = var.workflow_sids,
      task_channel_sids                          = var.task_channel_sids,
      webhook_url_studio_errors                  = local.webhook_url_studio_errors,
      short_helpline                             = var.short_helpline,
      short_environment                          = var.short_environment,
      channel_attributes = {
        default : templatefile(
          lookup(
            var.channel_attributes,
            each.value.messaging_mode == "conversations" ? "${each.key}-conversations" : each.key,
            var.channel_attributes[each.value.messaging_mode == "conversations" ? "default-conversations" : "default"]
          ),
          { task_language = var.task_language, helpline = var.helpline }
        )
      }


    }
  )
}

resource "twilio_flex_flex_flows_v1" "channel_flow" {
  for_each = {
    for idx, channel in var.channels :
    idx => channel if(channel.channel_type != "voice" && channel.messaging_mode == "programmable-chat")
  }
  channel_type         = each.value.channel_type
  chat_service_sid     = var.flex_chat_service_sid
  friendly_name        = "Flex ${title(replace(each.key, "_", " "))} Flow"
  integration_type     = "studio"
  janitor_enabled      = !var.enable_post_survey
  contact_identity     = each.value.contact_identity
  integration_flow_sid = twilio_studio_flows_v2.channel_studio_flow[each.key].sid
  enabled              = true
}

resource "twilio_conversations_configuration_addresses_v1" "conversations_address" {
  for_each = {
    for idx, channel in var.channels :
    idx => channel if(channel.channel_type != "voice" && channel.channel_type != "custom" && channel.messaging_mode == "conversations")
  }
  type                                   = each.value.channel_type
  address                                = each.value.contact_identity
  friendly_name                          = "${title(replace(each.key, "_", " "))} Conversation Address"
  auto_creation_enabled                  = true
  auto_creation_type                     = "studio"
  auto_creation_conversation_service_sid = var.flex_chat_service_sid
  auto_creation_studio_flow_sid          = twilio_studio_flows_v2.channel_studio_flow[each.key].sid
}

# Legacy format, remove once serverless & webchat are migrated to the new format below
resource "aws_ssm_parameter" "channel_flex_flow_sid_parameter" {
  for_each = {
    for idx, channel in var.channels :
    idx => channel if(channel.channel_type == "custom" && channel.messaging_mode == "programmable-chat")
  }
  name        = "${var.short_environment}_TWILIO_${var.short_helpline}_${upper(each.key)}_FLEX_FLOW_SID"
  type        = "SecureString"
  value       = twilio_flex_flex_flows_v1.channel_flow[each.key].sid
  description = "${title(replace(each.key, "_", " "))} Flex Flow SID"
}


resource "aws_ssm_parameter" "channel_flex_flow_sid" {
  for_each = {
  for idx, channel in var.channels :
  idx => channel if(channel.channel_type == "custom" && channel.messaging_mode == "programmable-chat")
  }
  name        = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/${each.key}_flex_flow_sid"
  type        = "SecureString"
  value       = twilio_flex_flex_flows_v1.channel_flow[each.key].sid
  description = "${title(replace(each.key, "_", " "))} Flex Flow SID"
}


resource "aws_ssm_parameter" "channel_studio_flow_sid" {
  for_each = {
  for idx, channel in var.channels :
  idx => channel if(channel.channel_type == "custom" && channel.messaging_mode == "conversations")
  }
  name        = "/${lower(var.environment)}/twilio/${nonsensitive(var.twilio_account_sid)}/${each.key}_studio_flow_sid"
  type        = "SecureString"
  value       = twilio_studio_flows_v2.channel_studio_flow[each.key].sid
  description = "${title(replace(each.key, "_", " "))} Studio Flow SID"
}

#This will need to be removed after the conversations migration
resource "aws_ssm_parameter" "messaging_mode" {
  for_each = {
  for idx, channel in var.channels :
  idx => channel if(channel.channel_type == "custom")
  }
  name        = "/${lower(var.environment)}/${each.key}/${nonsensitive(var.twilio_account_sid)}/messaging_mode"
  type        = "SecureString"
  value       = each.value.messaging_mode
  description = "${title(replace(each.key, "_", " "))} Messaging Mode"
}





module "custom_lambdas" {
  source = "../custom-lambdas"
  for_each = local.custom_lambda_channels

  channel  = each.key
  helpline = var.helpline
  short_helpline = var.short_helpline
  region = var.region
  environment = var.environment
  base_priority = var.base_priority + index(keys(local.custom_lambda_channels), each.key)
}