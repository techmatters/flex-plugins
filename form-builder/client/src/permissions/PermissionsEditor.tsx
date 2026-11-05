/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/**
 * Who can do what in HRM (the hrm repo's permission-rules/<name>.json), changed by Aselo staff and
 * seen, reviewed and commented on by helpline staff (the review panel at the top). Each action has
 * ways to be allowed, each a set of conditions; groups the helpline doesn't use (cases nobody can
 * do anything with, client profiles switched off) are folded away. The file goes to the hrm repo:
 * downloaded here, and in the changes' zip under hrm/. State and logic live in permissionsSlice.ts
 * and permissions.ts.
 */
import { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import type { PermissionCondition } from '@tech-matters/form-builder-shared';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { hashJson } from '../drafts/draftSlice';
import { ReviewPanel } from '../reviews/ReviewPanel';
import { useReviewContext } from '../workspace/useReviewContext';
import { SectionTitle } from '../help/HelpContext';
import { selectDefinitions, selectWorkspace } from '../workspace/workspaceSlice';
import {
  casesUnused,
  CONDITION_LABELS,
  type ConditionKind,
  conditionsFor,
  describeFieldRule,
  describeRule,
  FIELD_FORMS,
  formatPermissionRules,
  kindOf,
  newCondition,
  type PermissionAction,
  PERMISSION_GROUPS,
  type PermissionGroup,
  splitField,
  unknownKeys,
  valueOf,
} from './permissions';
import {
  permissionsOpened,
  selectPermissionChanges,
  selectPermissionIssues,
  selectPermissionRules,
  selectPermissionsEditor,
  setActionRule,
  shownAnyway,
} from './permissionsSlice';
import './permissions.css';

const download = (fileName: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// A condition's value, where it has one: a number of hours or days, a section kind, a field
const ConditionValue = ({
  condition,
  onChange,
}: {
  condition: PermissionCondition;
  onChange: (condition: PermissionCondition) => void;
}) => {
  const kind = kindOf(condition);
  const value = valueOf(condition);
  if (kind === 'createdHoursAgo' || kind === 'createdDaysAgo') {
    return (
      <input
        type="number"
        min={1}
        aria-label={kind === 'createdHoursAgo' ? 'Hours' : 'Days'}
        value={typeof value === 'number' ? value : ''}
        onChange={e => onChange({ [kind]: e.target.value === '' ? 0 : Number(e.target.value) })}
      />
    );
  }
  if (kind === 'sectionType') {
    return (
      <input
        type="text"
        aria-label="Section kind"
        value={String(value ?? '')}
        onChange={e => onChange({ sectionType: e.target.value.trim() })}
      />
    );
  }
  if (kind === 'field') {
    const { form, name } = splitField(String(value ?? ''));
    const fieldOf = (nextForm: string, nextName: string) => onChange({ field: `rawJson.${nextForm}.${nextName}` });
    return (
      <>
        <select aria-label="Form" value={form} onChange={e => fieldOf(e.target.value, name)}>
          {FIELD_FORMS.map(each => (
            <option key={each.key} value={each.key}>
              {each.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          aria-label="Field name"
          placeholder="Field name, e.g. lastName"
          value={name}
          onChange={e => fieldOf(form, e.target.value.trim())}
        />
      </>
    );
  }
  return null;
};

// One way to be allowed: its conditions, all of which must hold
const Way = ({
  actionKey,
  way,
  index,
  onChange,
  onRemove,
}: {
  actionKey: string;
  way: PermissionCondition[];
  index: number;
  onChange: (way: PermissionCondition[]) => void;
  onRemove: () => void;
}) => {
  const present = new Set(way.map(kindOf));
  const addable = conditionsFor(actionKey).filter(kind => !present.has(kind) || kind === 'field');
  return (
    <li className="permission-way">
      {index > 0 && <span className="permission-or">or</span>}
      {way.map((condition, position) => {
        const kind = kindOf(condition);
        return (
          <span key={position} className={kind ? 'permission-condition' : 'permission-condition unknown'}>
            {position > 0 && <span className="permission-and">and</span>}
            <span>{kind ? CONDITION_LABELS[kind].replace(' … ', ' ') : JSON.stringify(condition)}</span>
            <ConditionValue
              condition={condition}
              onChange={next => onChange(way.map((each, at) => (at === position ? next : each)))}
            />
            <button
              type="button"
              className="icon-button permission-edit"
              aria-label="Remove condition"
              title="Remove condition"
              onClick={() => onChange(way.filter((_each, at) => at !== position))}
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
      <select
        className="permission-edit"
        aria-label="Add a condition"
        value=""
        onChange={e => e.target.value && onChange([...way, newCondition(e.target.value as ConditionKind)])}
      >
        <option value="">{way.length > 0 ? '+ and…' : '+ Who…'}</option>
        {addable.map(kind => (
          <option key={kind} value={kind}>
            {CONDITION_LABELS[kind]}
          </option>
        ))}
      </select>
      <button type="button" className="link-button permission-edit" onClick={onRemove}>
        Remove this way
      </button>
    </li>
  );
};

const ActionRule = ({ action, ways }: { action: PermissionAction; ways: PermissionCondition[][] | undefined }) => {
  const dispatch = useAppDispatch();
  const issues = useAppSelector(selectPermissionIssues).filter(issue => issue.action === action.key);
  const list = Array.isArray(ways) ? ways : [];
  const set = (next: PermissionCondition[][]) => dispatch(setActionRule(action.key, next));
  const fieldRule = action.target === 'contactField' ? describeFieldRule(list) : undefined;
  return (
    <li className="permission-action" id={`permission-${action.key}`}>
      <div className="permission-action-head">
        <strong>{action.label}</strong>
        <span className="muted">{action.description}</span>
      </div>
      {fieldRule ? (
        <div className="permission-summary">
          {fieldRule.everyField && <div>Every field: {fieldRule.everyField}</div>}
          {fieldRule.fields.map(({ field, who }) => (
            <div key={field}>
              {field}: {who}
            </div>
          ))}
          {!fieldRule.everyField && fieldRule.fields.length === 0 && <div>No fields named: nothing is kept back.</div>}
        </div>
      ) : (
        <div className="permission-summary">
          <span className="muted">Who: </span>
          {describeRule(list)}
        </div>
      )}
      {list.length > 0 && (
        <ol className="permission-ways">
          {list.map((way, index) => (
            <Way
              key={index}
              actionKey={action.key}
              way={way}
              index={index}
              onChange={next => set(list.map((each, at) => (at === index ? next : each)))}
              onRemove={() => set(list.filter((_each, at) => at !== index))}
            />
          ))}
        </ol>
      )}
      <div className="permission-action-buttons permission-edit">
        <button
          type="button"
          className="link-button"
          onClick={() =>
            set([
              ...list,
              action.target === 'contactField' ? [newCondition('field'), 'isSupervisor'] : ['isSupervisor'],
            ])
          }
        >
          <Plus size={12} /> {action.target === 'contactField' ? 'Name a field' : 'Another way to be allowed'}
        </button>
        {list.length > 0 && action.target !== 'contactField' && (
          <button type="button" className="link-button" onClick={() => set([])}>
            Nobody
          </button>
        )}
      </div>
      {issues.map((issue, index) => (
        <p key={index} className={`issue issue-${issue.severity}`}>
          {issue.message}
        </p>
      ))}
    </li>
  );
};

const Group = ({ group, folded }: { group: PermissionGroup; folded?: { reason: string; show: string } }) => {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectPermissionRules);
  const canChange = useAppSelector(selectActingAsStaff);
  return (
    <section className="panel permission-group" aria-label={group.title}>
      <h3>{group.title}</h3>
      {group.description && <p className="muted">{group.description}</p>}
      {group.id === 'fields' && (
        <p className="alert alert-info">
          Field rules only apply where HRM has contact field permissions on (ENABLE_CONTACT_FIELD_PERMISSIONS);
          elsewhere everyone who can see or edit a contact sees and edits all its fields.
        </p>
      )}
      {folded ? (
        <div className="permission-folded">
          <p>{folded.reason}</p>
          {canChange && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => dispatch(shownAnyway(group.id === 'cases' ? 'cases' : 'profiles'))}
            >
              {folded.show}
            </button>
          )}
        </div>
      ) : (
        <ul className="permission-actions">
          {group.actions.map(action => (
            <ActionRule key={action.key} action={action} ways={current?.rules[action.key]} />
          ))}
        </ul>
      )}
    </section>
  );
};

// eslint-disable-next-line complexity
export const PermissionsEditor = () => {
  const dispatch = useAppDispatch();
  const { editorRevision } = useAppSelector(selectWorkspace);
  const info = useAppSelector(selectDefinitions)?.permissions;
  const current = useAppSelector(selectPermissionRules);
  const issues = useAppSelector(selectPermissionIssues);
  const changes = useAppSelector(selectPermissionChanges);
  const { shownAnyway: shown } = useAppSelector(selectPermissionsEditor);
  const canChange = useAppSelector(selectActingAsStaff);
  const review = useReviewContext();

  // Afresh when it opens, and when the draft's files are replaced
  useEffect(() => {
    dispatch(permissionsOpened());
  }, [dispatch, editorRevision]);

  const rules = current?.rules;
  const otherNames = info ? Object.entries(info.environments).filter(([, name]) => name !== info.name) : [];
  const errors = issues.filter(issue => issue.severity === 'error');
  const foldedOf = (group: PermissionGroup) => {
    if (!rules) return undefined;
    if (group.id === 'cases' && casesUnused(rules) && !shown.cases) {
      return {
        reason: 'This helpline doesn’t use cases: nobody can do anything with them.',
        show: 'Set up case permissions',
      };
    }
    if (group.id === 'profiles' && info && !info.clientProfiles && !shown.profiles) {
      return {
        reason: 'Client profiles are switched off for this helpline (Features), so these don’t apply.',
        show: 'Show them anyway',
      };
    }
    return undefined;
  };

  return (
    <div className="permissions">
      <section className="panel">
        <SectionTitle>Permissions</SectionTitle>
        <p className="muted">
          Who can do what with contacts, cases and client profiles. “Supervisors” are the people with the supervisor
          role in Flex; a contact’s owner is the counselor who took it, and a case’s creator the one who opened it.
          Changes reach the helpline once the file is committed to the hrm repo and HRM deployed (staging, then
          production).
        </p>
        {!canChange && (
          <p className="alert alert-info">
            The Aselo team sets these. Review them, and ask a question or leave a comment below if something should
            change.
          </p>
        )}
        {!info && <p>Permissions can’t be read here.</p>}
        {info && (
          <p>
            File: <code>{info.name}.json</code> in the hrm repo, read from {info.source}.
            {otherNames.map(([environment, name]) => ` ${environment} uses ${name}.json instead.`).join('')}
          </p>
        )}
        {info && info.sharedWith.length > 0 && (
          <p className="alert alert-warning">
            {info.name}.json is shared: {info.sharedWith.map(code => code.toUpperCase()).join(', ')} use it too, so a
            change here changes theirs.
          </p>
        )}
        {info?.error && <p className="alert alert-error">Couldn’t read the permissions: {info.error}</p>}
        {rules && canChange && (
          <div className="permission-download">
            <button
              type="button"
              className="secondary-button"
              disabled={errors.length > 0}
              title={errors.length > 0 ? 'Fix the problems first: HRM wouldn’t start' : undefined}
              onClick={() => info && download(`${info.name}.json`, formatPermissionRules(rules))}
            >
              Download for the hrm repo
            </button>
            <span className="muted">
              Goes in hrm-domain/hrm-core/permission-rules/. It’s also in the changes’ zip, under hrm/.
            </span>
          </div>
        )}
      </section>

      {review && rules && (
        <ReviewPanel
          review={review}
          target="section:permissions"
          fingerprint={hashJson(rules)}
          what="these permissions"
          title="Review: permissions"
        />
      )}

      {changes.length > 0 && (
        <section className="panel" aria-label="Changes">
          <h3>Changed in this draft</h3>
          <ul className="permission-changes">
            {changes.map(change => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </section>
      )}

      {issues.length > 0 && (
        <ul className="permission-issues" aria-label="Problems">
          {issues.map((issue, index) => (
            <li key={index} className={issue.severity === 'error' ? 'issue-error' : 'issue-warning'}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      {rules && (
        <fieldset className="permission-changes-allowed" disabled={!canChange}>
          {PERMISSION_GROUPS.map(group => (
            <Group key={group.id} group={group} folded={foldedOf(group)} />
          ))}
          {unknownKeys(rules).length > 0 && (
            <p className="muted">
              Also in the file, and kept as they are (HRM doesn’t use them): {unknownKeys(rules).join(', ')}.
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
};
