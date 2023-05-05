variable "short_environment" {
  description = "Short upper case environment identifier, typically 'PROD', 'STG' or 'DEV'"
  type        = string
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}
variable "task_language" {
  type        = string
  default     = ""
  description = "Override the default language by setting this"
}

variable "slack_webhook_url" {
  type        = string
  default     = ""
  description = "Slack income webhook"
}

variable "channels" {
  type = map(object({
    templatefile         = string,
    channel_type         = string,
    contact_identity     = string,
    channel_flow_vars    = map(string)
    chatbot_unique_names = list(string)
  }))

}
variable "workflow_sids" {
  type = map(string)

}
variable "task_channel_sids" {
  type = map(string)
}

variable "flow_vars" {
  type    = map(string)
  default = {}
}

variable "chatbots" {
  type = map(object({
    sid = string
  }))
  default = {}
}


variable "channel_attributes" {
  type = map(string)
}

variable "enable_post_survey" {
  type    = bool
  default = false
}


variable "flex_chat_service_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}
