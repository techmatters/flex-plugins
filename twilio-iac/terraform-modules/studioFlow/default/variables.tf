variable "custom_flow_definition" {
  type = string
  default = ""
  description = "Override the default flow by setting this"
}

variable "master_workflow_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "chat_task_channel_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "default_task_channel_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "pre_survey_bot_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
  default ="DELETED"
}

variable "serverless_url" {
  description = "Twilio Serverless URL"
  type        = string
}

variable "service_sid" {
  description = "Twilio Serverless Service SID"
  type        = string
}

variable "environment_sid" {
  description = "Twilio Serverless Environment SID"
  type        = string
}

variable "capture_channel_with_bot_function_sid" {
  description = "Twilio Serverless Function capture_channel_with_bot SID"
  type        = string
}