variable "short_helpline" {
  description = "Short (usually 2 letter) upper case code for helpline"
  type        = string
}

variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}


variable "environment" {
  description = "Full capitalised environment name, typically 'Production', 'Staging' or 'Development'"
  type        = string
}

variable "pager_duty_arn" {
  type = string
  default = "arn:aws:sns:us-east-1:712893914485:AWS-PagerDuty-Endpoint"
}

variable "email_arn" {
  type = string
  default = null
}

variable "cloudwatch_region" {
  description = "The region where the alarms should be created"
  type = string
  default = "us-east-1"
}