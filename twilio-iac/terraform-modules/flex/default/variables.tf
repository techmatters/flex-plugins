variable "twilio_account_sid" {
  description = "Twilio Account SID"
  type        = string
}

variable "serverless_url" {
  description = "URL used to access Aselo Twilio serverless functions"
  type        = string
}

variable "hrm_url" {
  description = "Custom URL for the HRM backend (leave blank and it will infer a default) from the environments name"
  type = string
  default = ""
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "operating_info_key" {
  description = "Operating info key for this helpline"
  type        = string
}

variable "permission_config" {
  description = "Key used to determine the permissions scheme to use. Normally the short helpline code in lowercase, unless the helpline hasn't had its own permissions configured yet, in which case it can 'borrow' a different set temporarily. Defaults to operating_key value"
  type        = string
  default = ""
}

variable "definition_version" {
  description = "Key that determines which set of form definitions this helpline will use"
  type        = string
}

variable "helpline_language" {
  description = "Keyword that determines the language to be used as default across the helpline"
  type        = string
  default = ""
}

variable "feature_flags" {
  description = "Map of feature flag settings. All values should be boolean"
  type = map(bool)
}

variable "multi_office_support" {
  description = "URL used to access Aselo Twilio serverless functions"
  type        = bool
  default = false
}

variable "service_configuration_bump" {
  description = "Used to kick off a service configuration patch. Changes to the configuration will kick off an update automatically, but this can be used to update the config to the configured values anyway - for example if the configuration has been changed outside of terraform and needs to be reset. Simply change this to any value other than the current one to trigger an update next apply."
  default = null
}

variable "flex_chat_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "messaging_studio_flow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "messaging_flow_contact_identity" {
  description = "SMS number or whatever for the messaging flow"
  type = string
  default = null
}

variable "custom_flex_messaging_flow_enabled" {
  description = "Enable or disable Flex SMS Messaging Flow"
  type = bool
  default = null
}

variable "custom_flex_webchat_flow_enabled" {
  description = "Enable or disable Flex Webchat Messaging Flow"
  type = bool
  default = null
}

variable "stage" {
  description = "Set to stage for terragrunt runs"
  type = string
  default = ""
}

// It is a little weird that these are optional, but this entire system may be movoded outside of TF soon anyway
variable "environment" {
  description = "Full capitialised environment name, typically 'Production', 'Staging' or 'Development'"
  type        = string
  default     = ""
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
  default     = ""
}