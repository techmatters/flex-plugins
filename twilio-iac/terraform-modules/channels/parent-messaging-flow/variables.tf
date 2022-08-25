variable "master_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "chat_task_channel_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "custom_messaging_studio_subflow_sid" {
  description = "Id of the Custom Subflow"
  type        = string
}

variable "pre_survey_bot_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}
