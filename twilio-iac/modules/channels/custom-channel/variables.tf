variable "task_language" {
  type = string
  default = ""
  description = "Override the default language by setting this"
}

variable "custom_flow_definition" {
  description = "Override the default flow by setting this"
  type = string
  default = ""
}

variable "custom_channel_attributes" {
  description = "Override the default channel attributes by setting this"
  type = string
  default = ""
}

variable "master_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "chat_task_channel_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "flex_chat_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "channel_name" {
  description = "Channel Name"
  type        = string
}
variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "janitor_enabled" {
  description = "Enable or disable Janitor"
  type        = bool
  default = true
}
