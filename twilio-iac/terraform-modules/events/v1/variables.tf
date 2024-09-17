variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "environment" {
  description = "Environment identifier, typically 'production', 'staging' or 'development'"
  type        = string
}

variable "webhook_url" {
  description = "The human readable helpline name."
  type        = string
  default     = "https://hrm-development.tl.techmatters.org/lambda/twilioEventStreams"
}

variable "subscriptions" {
  type = map(object({
    event         = string,
    additional_events     = list(string), 
  }))
  default ={
      studio_flow : {
      event  = "com.twilio.studio.flow.execution.started",
        additional_events = ["com.twilio.studio.flow.execution.ended","com.twilio.studio.flow.step.ended"]	
      },
      task_router :{
        event  = "com.twilio.taskrouter.reservation.created",
        additional_events = ["com.twilio.taskrouter.reservation.accepted","com.twilio.taskrouter.reservation.rejected"]	
      }
      }
}
