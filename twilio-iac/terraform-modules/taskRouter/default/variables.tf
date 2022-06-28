variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
  default = null
}

variable "helplines" {
  description = "List of helplines to route via helpline queue"
  type        = list(string)
  default = null
}

variable "serverless_url" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "custom_target_workers" {
  description = "Setting this will override the default task queue expression for target, which is locals.helplines_filter"
  type = string
  default = ""
}

variable "custom_task_routing_filter_expression" {
  description = "Setting this will override the default task routing filter expression, which is helpline=='<var.helpline>'"
  type = string
  default = ""
}

variable "custom_task_routing_survey_queue_target_filter_expression" {
  description = "Setting this will override the default filter expression for the survey queue in the survey workflow, which is read from the module's default_target_expression.tftpl"
  type        = string
  default = ""
}
