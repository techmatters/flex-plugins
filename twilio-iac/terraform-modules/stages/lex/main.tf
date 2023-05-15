provider "awscc" {
  region = var.helpline_region
}

module "lex" {
  source = "../../lex/v2"
  count  = var.lex_config == null ? 0 : 1

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  lex_config     = var.lex_config
}

output "lex_config" {
  value = module.lex[0].lex_config
}
