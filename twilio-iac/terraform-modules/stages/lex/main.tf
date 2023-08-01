provider "awscc" {
  region = var.helpline_region
}


locals {
  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  bots_definitions = tomap({
    for language, bots in var.lex_bot_languages :
    language => merge(
      [
        for bot in bots :
        fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/bots/${bot}.json")) :
        fileexists("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/bots/${bot}.json")) :
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/bots/${bot}.json"))


    ]...)
  })

  intents_definitions = tomap({
    for language, bots in var.lex_bot_languages :
    language => merge(
      [
        for bot in bots :
        fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/intents/${bot}.json")) :
        fileexists("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/intents/${bot}.json")) :
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/intents/${bot}.json"))


    ]...)
  })

  slot_types_names = tomap({
    for language, bots in var.lex_bot_languages :
    language => distinct(flatten([
      for obj_key, obj_value in local.intents_definitions[language] : [
        for slot_name, slot_data in obj_value["slots"] :
        slot_data["slot_type"]
      ]
  ])) })

  slot_types_definitions = tomap({
    for language, bots in var.lex_bot_languages :
    language => merge(
      [
        for slot_type in local.slot_types_names[language] :
        fileexists("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/${local.short_helpline}/configs/lex/${language}/slot_types/${slot_type}.json")) :
        fileexists("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type}.json") ?
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${language}/slot_types/${slot_type}.json")) :
        jsondecode(file("/app/twilio-iac/helplines/configs/lex/${substr(language, 0, 2)}/slot_types/${slot_type}.json"))
      ]...
  ) })



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

  bots = local.bots_definitions[each.key]
  intents = local.intents_definitions[each.key]
  slot_types = local.slot_types_definitions[each.key]

}


module "lexv2" {
  source = "../../lex/v2"
  count  = var.lex_v2_config == null ? 0 : 1

  helpline       = var.helpline
  short_helpline = var.short_helpline
  environment    = var.environment
  lex_config     = var.lex_v2_config
}


output "slot_types_definitions" {
  value = local.slot_types_definitions
}