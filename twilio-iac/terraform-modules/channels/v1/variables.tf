variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
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

variable "region" {
  description = "AWS region to create the resources"
  type        = string
}

variable "twilio_account_sid" {
  description = "Twilio Account SID (ACxxxx)"
  type        = string
}

variable "serverless_url" {
  description = "Serverless URL"
  type        = string
}

variable "get_profile_flags_for_identifiers_base_url" {
  description = "Base URL for the get profile flags for identifiers endpoint"
  type        = string
  default     = var.serverless_url
}

variable "serverless_service_sid" {
  description = "Serverless Service SID"
  type        = string
}

variable "serverless_environment_sid" {
  description = "Serverless Environment SID"
  type        = string
}

variable "task_language" {
  type        = string
  default     = ""
  description = "Override the default language by setting this"
}

variable "channels" {
  type = map(object({
    templatefile         = string,
    channel_type         = string,
    contact_identity     = string,
    channel_flow_vars    = map(string)
    chatbot_unique_names = list(string)
    lambda_channel       = optional(bool)
    messaging_mode       = optional(string, "programmable-chat")
    enable_datadog_monitor = optional(bool, false)
    custom_monitor = optional(object({
      query = optional(string)
      custom_schedule      = optional(object({
      rrule = optional(string)
      timezone = optional(string)
    }),{    })
    }))
    
  }))
  description = "Map of enabled channel objects with their attributes"

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

variable base_priority {
  description = "The base priority for the ALB rules"
  type        = number
}
