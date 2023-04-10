variable "environment" {
  description = "The environment for the helpline."
  type        = string
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

variable "default_autopilot_chatbot_enabled" {
  description = "Whether to enable the default autopilot chatbot."
  type        = bool
  default     = true
}
