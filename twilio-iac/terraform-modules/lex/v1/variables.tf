variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "name" {
  description = "The name of the lex bot."
  type        = string
}

variable "description" {
  description = "The description of the lex bot."
  type        = string
}
variable "locale" {
  description = "The locale of the lex bot."
  type        = string
  default     = "en-US"
}

variable "process_behavior" {
  description = "The process behavior of the lex bot."
  type        = string
  default     = "BUILD"
}

variable "child_directed" {
  description = "Whether the lex bot is child directed."
  type        = bool
}

variable "idle_session_ttl_in_seconds" {
  description = "The idle session ttl in seconds for the lex bot."
  type        = number
}

variable "abort_statement" {
  description = "The rejection statement for the lex bot."
  type = object({
    content      = string
    content_type = string
  })
}

variable "clarification_prompt" {
  description = "The closing response for the lex bot."
  type = object({
    max_attempts = number
    content      = string
    content_type = string
  })
}

variable "slot_types" {
  description = "The slot types for the helpline."
  type = map(object({
    description              = string
    value_selection_strategy = string
    values = map(object({
      synonyms = optional(list(string), []),
    }))
  }))
}

variable "intents" {
  description = "The intents for the helpline."
  type = map(object({
    description       = string
    sample_utterances = list(string)
    fulfillment_activity = object({
      type = string
    })
    conclusion_statement = object({
      content      = string
      content_type = string
    })
    rejection_statement = object({
      content      = string
      content_type = string
    })
    slots = map(object({
      priority        = number
      description     = string
      slot_constraint = string
      slot_type       = string
      value_elicitation_prompt = object({
        max_attempts = number
        content      = string
        content_type = string
      })
    }))
  }))
}
