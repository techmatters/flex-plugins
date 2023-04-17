/*==== Input variable definitions ======*/
variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
  default     = null
}

variable "helplines" {
  description = "List of helplines to route via helpline queue"
  type        = list(string)
  default     = null
}

variable "serverless_url" {
  description = "URL used to access Aselo Twilio serverless functions"
  type        = string
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
  description = "Setting this will override the default task routing filter expression, which is helpline=='<var.helpline>'"
  type        = string
  default     = ""
}
