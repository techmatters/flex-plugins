provider "awscc" {
  region = var.helpline_region
}

module "lex" {
  source = "../../lex/v1"
  count  = var.lex_config == null ? 0 : 1

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  lex_config     = var.lex_config
}
