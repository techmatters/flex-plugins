provider "awscc" {
  region = var.helpline_region
}

module "lex" {
  source = "../../lex/v1"

  providers = {
    aws           = aws
    aws.hl-region = aws.hl-region
  }

  for_each = var.lex_bots

  helpline                    = var.helpline
  short_helpline              = var.short_helpline
  environment                 = var.environment
  name                        = "${var.environment}_${var.short_helpline}_${each.key}"
  description                 = each.value.description
  child_directed              = each.value.child_directed
  idle_session_ttl_in_seconds = each.value.idle_session_ttl_in_seconds
  abort_statement             = each.value.abort_statement
  clarification_prompt        = each.value.clarification_prompt
  slot_types                  = each.value.slot_types
  intents                     = each.value.intents
}

module "lexv2" {
  source = "../../lex/v2"
  count  = var.lex_v2_config == null ? 0 : 1

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  lex_config     = var.lex_v2_config
}
