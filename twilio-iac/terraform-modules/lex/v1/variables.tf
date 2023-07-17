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

variable "language" {
  description = "The language for the lex bot."
  type        = string
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

variable "bots" {
  description = "The bots for the helpline."
  type = map(object({
    description                 = string
    locale                      = optional(string, "en-US")
    process_behavior            = optional(string, "BUILD")
    child_directed              = optional(bool, true)
    idle_session_ttl_in_seconds = optional(number, 300)
    enable_model_improvements   = optional(bool, true)
    abort_statement = object({
      content      = string
      content_type = string
    })
    clarification_prompt = object({
      max_attempts = number
      content      = string
      content_type = string
    })
    intents = list(string)
  }))
}
