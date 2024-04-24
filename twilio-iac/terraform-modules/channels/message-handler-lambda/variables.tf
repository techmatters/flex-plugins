variable "environment" {
  type        = string
  description = "The environment name"
}

variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "region" {
  type        = string
  description = "The region to deploy to"
}

variable "ssm_region" {
  description = "AWS region where the SSM parameters are located"
  type        = string
  default     = "us-east-1"
}

variable "name" {
  type        = string
  description = "The name of the lambda"
}

variable "timeout" {
  type        = number
  description = "The timeout for the lambda"
  default     = 5
}

variable "subnet_ids" {
  type        = list(string)
  description = "The subnets to deploy to"
  default     = []
}

variable "security_group_ids" {
  type        = list(string)
  description = "The security groups to deploy to"
  default     = []
}

variable "alb_listener_arn" {
  description = "ARN of the ALB listener to attach the lambda to"
  type        = string
}

variable "alb_paths" {
  description = "Path patterns to route to the lambda"
  type        = list(string)
  default     = null
}

variable "priority" {
  type        = number
  description = "The priority for the lambda target group"
  default     = 1
}

variable "channel" {
  type        = string
  description = "The service name for the lambda"
}

variable "policy_template" {
  type        = string
  description = "The policy template to use for the lambda"
}

variable "memory_size" {
  type        = number
  description = "The memory size for the lambda"
  default     = 128
}

variable "ephemeral_storage_size" {
  type        = number
  description = "The ephemeral storage size for the lambda"
  default     = 512
}

variable "maximum_retry_attempts" {
  type        = number
  description = "The maximum retry attempts for the lambda"
  default     = 2
}

variable "env_vars" {
  type        = map(string)
  description = "The environment variables for the lambda"
  default     = {}
}
