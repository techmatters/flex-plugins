variable "environment" {
  description = "The environment for the helpline."
  type = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type = string
}

variable "helpline" {
  description = "The human readable helpline name."
  type = string
}

variable "definition_version" {
  description = "The definition version for the helpline."
  type = string
}

variable "task_router_config" {
  description = "The task router config for the helpline."
  type = object({
    event_filters = list(string)
    additional_queues = list(object({}))
    channels = list(
      object({
        friendly_name = string
        unique_name = string
      })
    )
  })
}