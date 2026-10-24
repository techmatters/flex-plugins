/**
 * Helpline-level Okta objects: not tied to an environment, shared by the staging and production apps.
 * Deleting a group removes its members' access to every app, so groups are protected from destroy.
 */

resource "okta_group" "helpline" {
  for_each = var.helpline_groups

  name        = each.value.group_name
  description = each.value.group_description

  lifecycle {
    prevent_destroy = true
  }
}

resource "okta_group_rule" "helpline" {
  for_each = { for code, hl in var.helpline_groups : code => hl if hl.group_rule != null }

  name              = substr(coalesce(each.value.group_rule.name, each.value.group_name), 0, 50)
  status            = each.value.group_rule.status
  expression_type   = "urn:okta:expression:1.0"
  expression_value  = each.value.group_rule.expression
  group_assignments = [okta_group.helpline[each.key].id]
}
