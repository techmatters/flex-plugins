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

variable "channels" {
  type = map(object({
    templatefile      = string,
    channel_type      = string,
    contact_identity  = string
    channel_flow_vars = map(string)
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
  type    = map(string)
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
