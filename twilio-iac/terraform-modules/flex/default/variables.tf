variable "twilio_account_sid" {
  description = "Twilio Account SID"
  type        = string
}

variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
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
  type        = string
  default     = null
}

variable "custom_flex_messaging_flow_enabled" {
  description = "Enable or disable Flex SMS Messaging Flow"
  type        = bool
  default     = null
}

variable "custom_flex_webchat_flow_enabled" {
  description = "Enable or disable Flex Webchat Messaging Flow"
  type        = bool
  default     = null
}

variable "stage" {
  description = "Set to stage for terragrunt runs"
  type        = string
  default     = ""
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
