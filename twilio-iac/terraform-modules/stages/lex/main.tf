provider "awscc" {
  region = var.helpline_region
}


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

  /*slot_types = merge([
    for file_path in fileset("/app/twilio-iac/helplines/configs/lex/${each.key}/slot_types", "*.json") :
    jsondecode(file("/app/twilio-iac/helplines/configs/lex/${each.key}/slot_types/${file_path}"))
  ]...)*/
  intents = merge([for bot in each.value : jsondecode(file("/app/twilio-iac/helplines/configs/lex/${each.key}/intents/${bot}.json"))]...)
  
  slot_type_names = flatten([
      for obj_key, obj_value in intents : [
        for slot_name, slot_data in obj_value["slots"] : slot_data["slot_type"]
      ]
    ])
  
  bots    = merge([for bot in each.value : jsondecode(file("/app/twilio-iac/helplines/configs/lex/${each.key}/bots/${bot}.json"))]...)
}


module "lexv2" {
  source = "../../lex/v2"
  count  = var.lex_v2_config == null ? 0 : 1

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  lex_config     = var.lex_v2_config
}
