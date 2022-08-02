variable "account_sid" {}
variable "auth_token" {}
variable "serverless_url" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}

variable "aws_account_id" {
  description = "Numeric AWS account ID used in ARNs"
  type        = string
  default     = null
}

variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default = "Linux"
}

variable "helpline" {
  default = "Te Guío CO"
}

variable "short_helpline" {
  default = "CO"
}

variable "operating_info_key" {
  default = "co"
}

variable "environment" {
  default = "Staging"
}

variable "short_environment" {
  default = "STG"
}

variable "definition_version" {
  description = "Key that determines which set of form definitions this helpline will use"
  type        = string
  default = "co-v1"
}

variable "permission_config" {
  description = "Key that determines which set of permission rules this helpline will use"
  type        = string
  default = "co"
}

variable multi_office {
  default = false
  type = bool
  description = "Sets the multipleOfficeSupport flag in Flex Service Configuration"
}

variable "feature_flags" {
  description = "A map of feature flags that need to be set for this helpline's flex plugin"
  type = map(bool)
  default = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": false,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": true,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": true,
    "enable_previous_contacts": true
  }
}

variable "messaging_flow_contact_identity" {
  default = "+17752526377"
}

variable "custom_flex_messaging_flow_enabled" {
  description = "Enable or disable Flex SMS Messaging Flow"
  type = bool
  default = false
}

variable "custom_task_routing_filter_expression" {
  description = "Setting this will override the default task routing filter expression, which is helpline=='<var.helpline>'"
  type = string
  default = "channelType ==\"web\"  OR isContactlessTask == true OR twilioNumber == \"messenger:103574689075106\" OR  twilioNumber == \"twitter:1540032139563073538\"  OR channel_type ==\"twitter\""
}
