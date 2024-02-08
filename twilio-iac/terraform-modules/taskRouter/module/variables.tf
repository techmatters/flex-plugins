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

variable "event_callback_url" {
  description = "Call back URL"
  type        = string
}

variable "events_filter" {
  description = "Events filter"
  type        = list(string)
}

variable "task_queues" {
  description = "Task queues"
  type = list(object({
    friendly_name  = string
    target_workers = string
  }))
}

variable "workflows" {
  description = "Workflows"
  type = list(object({
    friendly_name = string
    filters = list(object({
      filter_friendly_name = string
      expression           = string
      targets = list(object({
        expression = string
        queue      = string
        timeout    = optional(number)
        priority   = optional(number)
        skip_if    = optional(string)
      }))
    }))
  }))
}

variable "task_channels" {
  description = "Task channels"
  type = list(object({
    friendly_name = string
    unique_name   = string
  }))
}
