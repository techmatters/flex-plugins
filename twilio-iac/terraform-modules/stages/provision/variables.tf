variable "environment" {
  type        = string
  description = "The environment for the helpline."
}

variable "short_helpline" {
  type        = string
  description = "The short code for the helpline."
}

variable "helpline" {
  type        = string
  description = "The human readable helpline name."
}


variable "operating_info_key" {
  type        = string
  description = "The operating info key for the helpline."
}

variable "custom_task_routing_filter_expression" {
  type        = string
  description = "The custom task routing filter expression for the helpline."
}

variable "helpline_region" {
  type        = string
  description = "The region for the helpline."
}

variable "manage_github_secrets" {
  type        = bool
  description = "Whether to manage the github secrets for the helpline."
}
