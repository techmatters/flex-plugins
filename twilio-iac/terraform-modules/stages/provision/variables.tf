variable "environment" {
  type        = string
  description = "The environment for the helpline."
}

variable "short_environment" {
  description = "The short code for the environment."
  type        = string
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

variable "helpline_region" {
  type        = string
  description = "The region for the helpline."
}

variable "aws_monitoring_region" {
  type        = string
  description = "The region for the AWS monitoring."
}

variable "manage_github_secrets" {
  type        = bool
  description = "Whether to manage the github secrets for the helpline."
}

variable "events_filter" {
  description = "Events filter"
  type        = list(string)
}

variable "task_queues" {
  description = "Task queues"
  type = map(object({
    friendly_name  = string
    target_workers = string
  }))
}

variable "workflows" {
  description = "Workflow template file"
  type = map(object({
    friendly_name = string
    templatefile  = string
  }))
}

variable "task_channels" {
  description = "Task channels"
  type        = map(string)
}

variable "custom_task_routing_filter_expression" {
  type        = string
  description = "The custom task routing filter expression for the helpline."
  default     = ""
}


variable "phone_numbers" {
  description = "Phone numbers"
  type        = map(list(string))
  default = null
}

variable "enable_old_survey_module" {
  description = "true to create survey resources with survey module"
  type        = bool
  default = false
}

variable "ui_editable" {
  description = " Whether or not the service is editable in the console"
  type        = bool
  default = false
}