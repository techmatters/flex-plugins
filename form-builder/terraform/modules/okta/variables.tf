variable "helplines" {
  description = "Short codes of the helplines whose staff use the builder; each gets a form-builder-<code> group."
  type        = list(string)

  validation {
    condition     = alltrue([for code in var.helplines : can(regex("^[a-z0-9]+$", code))])
    error_message = "Helpline codes are lower case letters and digits, e.g. usnm."
  }
}

variable "domain" {
  description = "Where the builder is served."
  type        = string
  default     = "form-builder.aselo.org"
}

variable "allow_local_dev" {
  description = "Also allow sign-in from the local dev server (http://localhost:5180)."
  type        = bool
  default     = true
}
