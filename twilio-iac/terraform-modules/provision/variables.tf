variable "environment" {
  type = string
  description = "The environment for the helpline."
}

variable "short_helpline" {
  type = string
  description = "The short code for the helpline."
}

variable "helpline" {
  type = string
  description = "The human readable helpline name."
}

variable "operating_info_key" {
  type        = string
  description = "The operating info key for the helpline."
}

variable multi_office {
  type = bool
  description = "Sets the multipleOfficeSupport flag in Flex Service Configuration"
}

variable "feature_flags" {
  description = "A map of feature flags that need to be set for this helpline's flex plugin"
  type = map(bool)
}

variable "custom_task_routing_filter_expression" {
  type = string
  description = "The custom task routing filter expression for the helpline."
}

variable "target_task_name" {
  type = string
  description = "The target task name for the helpline."
}

variable "enable_post_survey" {
  type = bool
  description = "Whether to enable the post survey for the helpline."
}

variable "custom_channels" {
  type = list(string)
  description = "The custom channels for the helpline."
}

variable "twilio_channels" {
  type = map(object({
    channel_type = string
    contact_identity = string
  }))
  description = "The twilio channels for the helpline."
}

variable "helpline_region" {
  type = string
  description = "The region for the helpline."
}