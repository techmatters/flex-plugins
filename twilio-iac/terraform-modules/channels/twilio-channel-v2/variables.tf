variable "task_language" {
  type = string
  default = ""
  description = "Override the default language by setting this"
}

variable "custom_flow_definition" {
  type = string
  default = ""
  description = "Override the default flow by setting this"
}

variable "custom_channel_attributes" {
  type = string
  default = ""
  description = "Override the default flow by setting this"
}

variable "pre_survey_bot_sid" {
  description = "Internal Twilio resource SID provided by another module"
  default = ""
  type        = string
}

variable "target_task_name" {
  description = "Internal Twilio resource SID provided by another module"
  default = ""
  type        = string
}

variable "address" {
  description = "Conversation address"
  type = string
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

variable "channel_type" {
  description = "Channel Type needed for the creation of the Flex resource channel"
  type        = string
}
