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

  lex_v2_bots       = var.lex_v2_bots[each.key]
  lex_v2_intents    = var.lex_v2_intents[each.key]
  lex_v2_slots      = var.lex_v2_slots[each.key]
  lex_v2_slot_types = var.lex_v2_slot_types[each.key]
}


output "lex_v2_bot_details" {
  value = {
    for bot_key, bot_value in var.lex_v2_bots : 
    bot_key => bot_value
  }
}
