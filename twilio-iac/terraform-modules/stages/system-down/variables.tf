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

variable "system_down_templatefile" {
  type        = string
  default     = ""
  description = "System down template file"
}

variable "system_down_flow_vars" {
  type        = map(string)
  default     = {}
  description = "Studio flow variables"
}

variable "debug_mode" {
  type        = string
  default     = "widget_failures"
  description = "Debug mode"
  }