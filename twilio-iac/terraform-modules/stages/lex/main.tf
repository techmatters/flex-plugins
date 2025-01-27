# provider "awscc" {
#   region = var.helpline_region
# }

module "lex" {
  source = "../../lex/v1"

  providers = {
    aws           = aws
    aws.hl-region = aws.hl-region
  }

  for_each = var.lex_bot_languages

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  language       = each.key

  bots       = var.lex_bots[each.key]
  intents    = var.lex_intents[each.key]
  slot_types = var.lex_slot_types[each.key]
}

module "lex_v2" {
  source = "../../lex/v2"

  providers = {
    aws           = aws
    aws.hl-region = aws.hl-region
  }
  for_each = var.enable_lex_v2 ? var.lex_bot_languages : {}

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  language       = each.key

  bots       = var.lex_bots[each.key]
  intents    = var.lex_intents[each.key]
  slot_types = var.lex_slot_types[each.key]
}


# module "lexv2" {
#   source = "../../lex/v2"
#   count  = var.lex_v2_config == null ? 0 : 1

#   helpline       = var.helpline
#   short_helpline = var.short_helpline
#   environment    = var.environment
#   lex_config     = var.lex_v2_config
# }
