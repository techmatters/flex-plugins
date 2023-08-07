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
  slot_types     = each.value.slot_types
  intents        = each.value.intents
  bots           = each.value.bots
}

# module "lexv2" {
#   source = "../../lex/v2"
#   count  = var.lex_v2_config == null ? 0 : 1

#   helpline       = var.helpline
#   short_helpline = var.short_helpline
#   environment    = var.environment
#   lex_config     = var.lex_v2_config
# }
