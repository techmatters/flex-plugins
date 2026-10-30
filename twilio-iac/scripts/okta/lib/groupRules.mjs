// Group rules: configured in helplines/<code>/common.hcl (okta.group_rule) but created by a person
// in Okta, because only Super Admins / Org Admins can edit rules. These helpers check that what is in
// Okta matches the configuration.

import { oktaGet } from './oktaClient.mjs';
import { getHelplineOkta } from './helplineConfig.mjs';

/** Okta expression for a structured rule. Same output as terraform-modules/stages/okta-org/main.tf. */
export function renderRuleExpression(rule) {
  if (rule.expression) return rule.expression;
  if (rule.organizations) return rule.organizations.map((org) => `user.organization=="${org}"`).join(' OR ');
  return rule.email_domains.map((domain) => `String.stringContains(user.email,"${domain}")`).join(' OR ');
}

/** { code, ruleName, groupName, expression } for a helpline with okta.group_rule, otherwise null. */
export function getExpectedGroupRule(code) {
  const okta = getHelplineOkta(code);
  if (!okta?.group_rule) return null;
  const kinds = ['email_domains', 'organizations', 'expression'].filter((k) => okta.group_rule[k] !== undefined);
  if (kinds.length !== 1) throw new Error(`${code}: okta.group_rule must set exactly one of email_domains, organizations or expression`);
  return {
    code,
    ruleName: (okta.group_rule.name || okta.group_name).slice(0, 50),
    groupName: okta.group_name,
    expression: renderRuleExpression(okta.group_rule),
  };
}

/** All group rules in the org with their target group names resolved. */
export async function fetchGroupRules() {
  const rules = await oktaGet('/api/v1/groups/rules?limit=200');
  const groupNameById = {};
  for (const id of new Set(rules.flatMap((r) => r.actions?.assignUserToGroups?.groupIds || []))) {
    try {
      groupNameById[id] = (await oktaGet(`/api/v1/groups/${id}`)).profile.name;
    } catch {
      groupNameById[id] = `(deleted group ${id})`;
    }
  }
  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    expression: r.conditions?.expression?.value ?? '',
    groupNames: (r.actions?.assignUserToGroups?.groupIds || []).map((id) => groupNameById[id]),
  }));
}

const manualSteps = (expected) =>
  `create it in Okta Admin › Directory › Groups › Rules › Add rule: name "${expected.ruleName}", ` +
  `"Use Okta Expression Language": ${expected.expression} , assign to "${expected.groupName}", then Activate`;

/** Check one helpline's expected rule against the rules in Okta. Returns a list of results. */
export function checkGroupRule(expected, rules) {
  const targeting = rules.filter((r) => r.groupNames.includes(expected.groupName));
  if (targeting.length === 0) {
    return [{ check: 'Group rule exists in Okta', ok: false, severity: 'error', detail: `no rule assigns to "${expected.groupName}": ${manualSteps(expected)}` }];
  }

  const matching = targeting.find((r) => r.expression === expected.expression);
  if (!matching) {
    return [
      {
        check: 'Group rule expression matches the configuration',
        ok: false,
        severity: 'error',
        detail: `Okta has ${targeting.map((r) => `"${r.name}": ${r.expression}`).join('; ')}; config expects ${expected.expression}`,
      },
    ];
  }

  const results = [
    { check: 'Group rule exists and matches the configuration', ok: true, severity: 'ok', detail: matching.name },
  ];
  if (matching.status !== 'ACTIVE') results.push({ check: 'Group rule is active', ok: false, severity: 'error', detail: `"${matching.name}" is ${matching.status}: activate it in Okta` });
  if (matching.name !== expected.ruleName) results.push({ check: 'Group rule name matches', ok: false, severity: 'warning', detail: `"${matching.name}" (config: "${expected.ruleName}")` });
  return results;
}
