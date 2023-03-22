variable "environment" {
  description = "The environment for the helpline."
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

variable "definition_version" {
  description = "The definition version for the helpline."
  type        = string
}

variable "operating_info_key" {
  type        = string
  description = "The operating info key for the helpline."
}

variable "multi_office" {
  type        = bool
  description = "Sets the multipleOfficeSupport flag in Flex Service Configuration"
}

variable "feature_flags" {
  description = "A map of feature flags that need to be set for this helpline's flex plugin"
  type        = map(bool)
}

variable "target_task_name" {
  type        = string
  description = "The target task name for the helpline."
}

variable "enable_post_survey" {
  type        = bool
  description = "Whether to enable the post survey for the helpline."
}

variable "custom_channels" {
  type        = list(string)
  description = "The custom channels for the helpline."
}

variable "twilio_channels" {
  type = map(object({
    channel_type     = string
    contact_identity = string
  }))
  description = "The twilio channels for the helpline."
}

variable "twilio_channel_custom_flow_template" {
  type        = string
  description = "The twilio channel custom flow template for the helpline."
}

variable "custom_channel_custom_flow_template" {
  type        = string
  description = "The custom channel custom flow template for the helpline."
}

variable "enable_voice_channel" {
  type        = bool
  description = "Whether to enable the voice channel for the helpline."
}

variable "channel_attributes" {
  type        = map(string)
  description = "The channel attributes for the helpline."
}

variable "custom_channel_attributes" {
  type        = map(string)
  description = "The custom channel attributes for the helpline."
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

variable "permission_config" {
  description = "The permission config for the helpline."
  type = string
  default = ""
}
