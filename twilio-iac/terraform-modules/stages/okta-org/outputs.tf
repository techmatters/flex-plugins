output "helpline_group_names" {
  value = module.helpline_groups.group_names
}

# Reminder for the person running this stage: these rules must exist in Okta, created by hand
# (Okta Admin › Directory › Groups › Rules › Add rule › "Use Okta Expression Language", then Activate).
# Check them with: node twilio-iac/scripts/okta/auditGroupRules.mjs
output "group_rules" {
  description = "Group rules to create manually in Okta (Super Admin / Org Admin only)."
  value = {
    for code, expression in local.group_rule_expressions : code => {
      rule_name    = substr(coalesce(var.helpline_okta[code].group_rule.name, var.helpline_okta[code].group_name), 0, 50)
      assign_to    = var.helpline_okta[code].group_name
      expression   = expression
      how_to_check = "node twilio-iac/scripts/okta/auditGroupRules.mjs --hl ${code}"
    }
  }
}
