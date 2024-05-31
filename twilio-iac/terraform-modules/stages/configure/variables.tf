variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "helpline_region" {
  type        = string
  description = "The region for the helpline."
}

variable "short_environment" {
  description = "The short code for the environment."
  type        = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "contacts_waiting_channels" {
  description = "List of contact waiting channels"
  type        = list(string)
}

variable "target_task_name" {
  type        = string
  description = "The target task name for the helpline."
}

variable "twilio_channels" {
  type = map(object({
    channel_type     = string
    contact_identity = string
  }))
  description = "The twilio channels for the helpline."
  default     = {}
}

variable "enable_voice_channel" {
  type        = bool
  description = "Whether to enable the voice channel for the helpline."
  default     = false
}


variable "task_router_config" {
  description = "The task router config for the helpline."
  type = object({
    event_filters     = list(string)
    additional_queues = list(object({}))
    channels = list(
      object({
        friendly_name = string
        unique_name   = string
      })
    )
  })
  default = {
    event_filters     = []
    additional_queues = []
    channels          = []
  }
}

variable "twilio_channel_custom_flow_template" {
  type        = string
  description = "The twilio channel custom flow template for the helpline."
  default     = ""
}

variable "custom_channel_custom_flow_template" {
  type        = string
  description = "The custom channel custom flow template for the helpline."
  default     = ""
}

variable "custom_channel_attributes" {
  type        = map(string)
  description = "The custom channel attributes for the helpline."
  default     = {}
}

variable "custom_channels" {
  type        = list(string)
  description = "The custom channels for the helpline."
  default     = []
}

variable "operating_hours_function_sid" {
  type        = string
  description = "The operating hours function sid for the helpline."
  default     = ""
}

variable "strings" {
  type        = map(string)
  description = "The strings for the helpline."
  default     = {}
}

variable "voice_ivr_language" {
  type        = string
  description = "The voice ivr language for the helpline."
  default     = "en-US"
}

variable "janitor_enabled" {
  type        = bool
  description = "Whether to enable the janitor for the helpline."
  default     = true
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
    contact_identity     = string
    channel_flow_vars    = map(string)
    chatbot_unique_names = list(string)
    messaging_mode  = optional(string,"programmable-chat")
  }))
  description = "Map of enabled channel objects with their attributes"

}

variable "flow_vars" {
  type        = map(string)
  default     = {}
  description = "Studio flow variebles common to all channels"
}

variable "channel_attributes" {
  type = map(string)
}

variable "enable_post_survey" {
  type    = bool
  default = false
}

variable "hrm_transcript_retention_days_override" {
  description = "Number of days to retain HRM Contact Job Cleanup logs"
  type        = number
  default     = -1
}

variable "case_status_transition_rules" {
  description = "List of case status transition rules, specifying the starting status, how long it has to have been in that status to qualify for the transition, and the target status. A description is also required."
  type = list(object({
    startingStatus = string
    targetStatus = string
    description = string
    timeInStatusInterval = string
  }))
  default = null
}