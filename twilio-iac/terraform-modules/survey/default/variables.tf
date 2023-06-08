variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}

variable "flex_task_assignment_workspace_sid" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "custom_task_routing_filter_expression" {
  description = "Setting this will override the default task routing filter expression for the survey workflow, which is helpline=='<var.helpline>'"
  type        = string
  default = ""
}

variable "custom_task_routing_survey_queue_target_filter_expression" {
  description = "Setting this will override the default filter expression for the survey queue in the survey workflow, which is isSurveyTask==true"
  type        = string
  default = "isSurveyTask==true"
}

