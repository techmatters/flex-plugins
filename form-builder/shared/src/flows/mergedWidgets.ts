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
 * Two live widgets shown as one object, as the board draws them new: a check (an HTTP request to
 * getProfileFlagsForIdentifier, operatingHours, isSkilledWorkerAvailable...) and the split on its
 * answer, a voice menu (Gather) and the split on its digits, or a counter (Set Variables adding one)
 * and the split on it, which is a Repeat. Imported pairs are merged into one object (the first
 * widget's), and split back into their two widgets, as they are live, when the flow is exported.
 */

import {
  BoardContent,
  checkNoMatchNameOf,
  conditionExitName,
  Connection,
  counterOf,
  FlowObject,
  FlowObjectType,
  OBJECT_TYPES,
  repeatNameFromCounter,
} from './model';

// Kinds whose answer a split reads right after them: the Studio widgets they are, the way out that
// leads to the split, and what the split reads (a request's answer, a menu's keys pressed)
type Answered = { studioTypes: string[]; from: string; reads: (name: string, input: string) => boolean };
const CHECK: Answered = {
  studioTypes: ['make-http-request', 'run-function'],
  from: 'success',
  reads: (name, input) => input.includes(`widgets.${name}.`),
};
const ANSWERED: Partial<Record<FlowObjectType, Answered>> = {
  checkClientProfile: CHECK,
  checkOperatingHours: CHECK,
  checkQueueAvailability: CHECK,
  checkWorkerLoggedIn: CHECK,
  // A voice menu's options: the split on its digits
  menuVoice: {
    studioTypes: ['gather-input-on-call'],
    from: 'keypress',
    reads: (name, input) => input.trim() === `{{widgets.${name}.Digits}}`,
  },
};
const answeredBy = (object: Pick<FlowObject, 'type' | 'studio'>) => {
  const answered = ANSWERED[object.type];
  return answered && object.studio && answered.studioTypes.includes(object.studio.type) ? answered : undefined;
};

// The split's way out a Repeat goes back round on, and the one past its maximum
const REPEAT_EXITS = ['repeat', 'max reached'];

type Transition = Record<string, unknown>;
const eventOf = (transition: Transition) => String(transition.event ?? '');

// A counter's split: noMatch goes back round, one condition (greater than the times to repeat) goes on
const repeatSplitOf = (split: FlowObject, counter: string) => {
  const transitions = split.studio?.transitions ?? [];
  const input = split.studio?.properties?.input;
  if (transitions.length !== 2 || typeof input !== 'string' || input.trim() !== `{{flow.variables.${counter}}}`) {
    return undefined;
  }
  const noMatch = transitions.findIndex(transition => eventOf(transition) === 'noMatch');
  const match = transitions.findIndex(transition => eventOf(transition) === 'match');
  const conditions = transitions[match]?.conditions;
  if (noMatch < 0 || match < 0 || !Array.isArray(conditions) || conditions.length !== 1) return undefined;
  const [{ type, value }] = conditions as { type?: unknown; value?: unknown }[];
  if (type !== 'greater_than' || typeof value !== 'string' || !/^\d+$/.test(value.trim())) return undefined;
  return { noMatch, match, maxRepeats: value.trim() };
};

// Conditions that can't match when there's nothing to compare (a failed request, no keys pressed)
const ANSWER_CONDITIONS = new Set([
  'equal_to',
  'matches_any_of',
  'contains',
  'starts_with',
  'greater_than',
  'less_than',
  'regex',
]);
const onlyMatchesAnswers = (split: FlowObject) =>
  (split.studio?.transitions ?? []).every(
    transition =>
      eventOf(transition) !== 'match' ||
      (Array.isArray(transition.conditions) &&
        (transition.conditions as { type?: unknown }[]).every(condition =>
          ANSWER_CONDITIONS.has(String(condition.type)),
        )),
  );
const noMatchIndexOf = (split: FlowObject) =>
  (split.studio?.transitions ?? []).findIndex(transition => eventOf(transition) === 'noMatch');

/**
 * Imported objects with the split that only they lead to merged into one: the check, with the
 * split's ways out and its own (failed), or a Repeat. The split's widget is kept in studioSplit.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const mergeImportedPairs = (objects: FlowObject[], connections: Connection[]) => {
  const byId = new Map(objects.map(object => [object.id, object]));
  const merged = new Map<string, FlowObject>();
  // Each split merged, and the object it's merged into
  const into = new Map<string, string>();
  // The connections each merged pair no longer needs, and the split's ways out renamed (a Repeat's)
  const dropped = new Set<string>();
  const exitRenames = new Map<string, Map<string, string>>();
  // Other ways out of a check or menu that led to its split (failed, a menu's speech or timeout),
  // now leading where the split's noMatch does
  const retargeted = new Map<string, string>();

  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity -- each condition is a reason not to merge
  objects.forEach(first => {
    if (!first.studio || into.has(first.id)) return;
    const answered = answeredBy(first);
    const isCheck = answered !== undefined;
    const counter = isCheck ? undefined : counterOf(first);
    if (!isCheck && !counter) return;
    const from = answered?.from ?? 'next';
    const link = connections.find(connection => connection.from === first.id && connection.exit === from);
    const split = link && byId.get(link.to);
    if (!link || !split?.studio || split.studio.type !== 'split-based-on') return;
    if (merged.has(split.id) || into.has(split.id)) return;
    // Only when nothing else leads to the split (a check's own failed may: below)
    const leading = connections.filter(connection => connection.to === split.id && connection.id !== link.id);
    if (leading.some(connection => connection.from !== first.id || !isCheck)) return;
    const ownExits = (first.exits ?? []).filter(exit => exit !== from);
    // Where the split is in the template, to write it back there
    const after = objects[objects.indexOf(split) - 1]?.studio?.name ?? '';
    if (isCheck) {
      const input = split.studio.properties?.input;
      if (typeof input !== 'string' || !answered!.reads(first.studio.name, input)) return;
      const splitExits = split.exits ?? [];
      if (splitExits.some(exit => ownExits.includes(exit))) return;
      // A failed request, or a menu answered by speech or not at all, leading to the split too takes
      // its noMatch (no answer matches none of its conditions), so on the board it goes where noMatch goes
      if (leading.length > 0 && !onlyMatchesAnswers(split)) return;
      const noMatch = connections.find(
        connection => connection.from === split.id && connection.exit === splitExits[noMatchIndexOf(split)],
      );
      leading.forEach(connection => {
        if (noMatch) retargeted.set(connection.id, noMatch.to);
        else dropped.add(connection.id);
      });
      const check: FlowObject = {
        ...first,
        exits: [...splitExits, ...ownExits],
        studioSplit: {
          ...split.studio,
          from,
          after,
          ...(leading.length > 0 ? { alsoFrom: leading.map(connection => connection.exit ?? '') } : {}),
        },
      };
      // Its noMatch named as a new check's ("not available"), when it splits as one does
      const noMatchName = checkNoMatchNameOf(check);
      if (noMatchName) {
        check.exits = check.exits!.map(exit => (exit === 'noMatch' ? noMatchName : exit));
        exitRenames.set(split.id, new Map([['noMatch', noMatchName]]));
      }
      merged.set(first.id, check);
    } else {
      const repeat = repeatSplitOf(split, counter!);
      if (!repeat) return;
      const { variables: _variables, ...rest } = first;
      merged.set(first.id, {
        ...rest,
        ...OBJECT_TYPES.repeat.defaultSize,
        type: 'repeat',
        studioName: repeatNameFromCounter(first.studio.name, counter!),
        exits: REPEAT_EXITS,
        settings: { maxRepeats: repeat.maxRepeats },
        studioSplit: { ...split.studio, from, after },
      });
      const exits = split.exits ?? [];
      exitRenames.set(
        split.id,
        new Map([
          [exits[repeat.noMatch], REPEAT_EXITS[0]],
          [exits[repeat.match], REPEAT_EXITS[1]],
        ]),
      );
    }
    into.set(split.id, first.id);
    dropped.add(link.id);
  });

  return {
    objects: objects.filter(object => !into.has(object.id)).map(object => merged.get(object.id) ?? object),
    connections: connections
      .filter(connection => !dropped.has(connection.id))
      .map(connection => {
        const to = retargeted.get(connection.id);
        if (to) return { ...connection, to };
        const first = into.get(connection.from);
        if (!first) return connection;
        const exit = connection.exit && (exitRenames.get(connection.from)?.get(connection.exit) ?? connection.exit);
        return { ...connection, from: first, ...(exit ? { exit } : {}) };
      }),
  };
};

const SPLIT_ID_SUFFIX = ':split';

/**
 * A check imported with its split, seen as that split: its ways out (all but the check's own, e.g.
 * failed), their conditions as live and the operators chosen on the board. For what's said and
 * chosen about a split's conditions; undefined for anything else (Repeats included).
 */
export const splitViewOf = <T extends Pick<FlowObject, 'type' | 'exits' | 'settings' | 'studio' | 'studioSplit'>>(
  object: T,
): T | undefined => {
  const { studio, studioSplit } = object;
  if (!studio || !studioSplit || object.type === 'repeat') return undefined;
  const { from, after: _after, alsoFrom: _alsoFrom, ...split } = studioSplit;
  const own = (studio.transitions ?? []).map(eventOf).filter(event => event !== from);
  return {
    ...object,
    type: 'decision',
    settings: undefined,
    exits: (object.exits ?? []).filter(exit => !own.includes(exit)),
    studio: split,
    studioSplit: undefined,
  };
};

/**
 * The board with each merged object back as its two widgets (as they were imported, with the
 * board's changes), for the Studio export. Merged objects made another kind on the board, or a
 * Repeat renamed, are new widgets of their kind; `todo` says so.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const splitMergedObjects = (content: BoardContent): { content: BoardContent; todo: string[] } => {
  const todo: string[] = [];
  if (!content.objects.some(object => object.studioSplit)) return { content, todo };
  const objects: FlowObject[] = [];
  const splits: { split: FlowObject; first: string; after?: string }[] = [];
  let connections = [...content.connections];

  // eslint-disable-next-line complexity -- a check or a Repeat, each with its own ways out
  content.objects.forEach(object => {
    const { studio, studioSplit } = object;
    if (!studio || !studioSplit) {
      objects.push(object);
      return;
    }
    const { from, after, alsoFrom: _alsoFrom, ...live } = studioSplit;
    const splitWidget = { ...live };
    const label = `“${object.studioName ?? object.text}”`;
    const counter = counterOf(object);
    const isCheck = answeredBy(object) !== undefined;
    const isRepeat = object.type === 'repeat' && counter !== undefined;
    if (!isCheck && !isRepeat) {
      // Made another kind on the board: a new widget of its kind
      todo.push(`${label} was ${studio.name} and ${studioSplit.name} in Studio: built as a new one.`);
      objects.push({ ...object, studio: undefined, studioSplit: undefined });
      return;
    }
    if (isRepeat && object.studioName && object.studioName !== repeatNameFromCounter(studio.name, counter)) {
      todo.push(
        `${label} was ${studio.name} and ${studioSplit.name} in Studio: renamed, so built as a new Repeat (monitoring that uses the old names follows them).`,
      );
      objects.push({ ...object, studio: undefined, studioSplit: undefined });
      return;
    }

    const splitId = `${object.id}${SPLIT_ID_SUFFIX}`;
    const ownExits = (studio.transitions ?? []).map(eventOf).filter(event => event !== from);
    // A Repeat's times to repeat, changed on the board: its split's condition compares with the new one
    const repeat = isRepeat ? repeatSplitOf({ ...object, studio: splitWidget }, counter) : undefined;
    const maxRepeats = object.settings?.maxRepeats?.trim();
    if (repeat && maxRepeats && /^\d+$/.test(maxRepeats) && maxRepeats !== repeat.maxRepeats) {
      splitWidget.transitions = splitWidget.transitions!.map((transition, index) => {
        if (index !== repeat.match) return transition;
        const [condition] = transition.conditions as Record<string, unknown>[];
        const studioNamed = condition.friendly_name === `If value greater_than ${repeat.maxRepeats}`;
        return {
          ...transition,
          conditions: [
            {
              ...condition,
              value: maxRepeats,
              ...(studioNamed ? { friendly_name: `If value greater_than ${maxRepeats}` } : {}),
            },
          ],
        };
      });
    } else if (isRepeat && maxRepeats && maxRepeats !== repeat?.maxRepeats) {
      todo.push(`${label}: its times to repeat (${maxRepeats}) isn't a number; kept as it is live.`);
    }
    // A Repeat's ways out are its split's (noMatch goes back round); a check's, the split's and its own
    const splitTransitions = splitWidget.transitions ?? [];
    const repeatExits = splitTransitions.map((transition, index) => {
      if (eventOf(transition) === 'noMatch') return 'noMatch';
      // eslint-disable-next-line camelcase -- as Studio writes it
      const [condition] = (transition.conditions ?? []) as { friendly_name?: string; value?: string }[];
      return conditionExitName(condition?.friendly_name, condition?.value) ?? `match ${index + 1}`;
    });
    const splitExitOf = (exit: string) => {
      if (!isRepeat) return exit;
      return exit === REPEAT_EXITS[0] ? 'noMatch' : repeatExits[repeat?.match ?? 1];
    };
    const splitExits = isRepeat ? repeatExits : (object.exits ?? []).filter(exit => !ownExits.includes(exit));
    const isOwn = (exit: string) => !isRepeat && ownExits.includes(exit);
    const ended = object.endedExits ?? [];

    const first: FlowObject = {
      ...object,
      ...(isRepeat
        ? {
            type: 'setVariable' as const,
            studioName: studio.name,
            settings: undefined,
            variables: (studio.properties?.variables as { key?: string; value?: string }[]).map(variable => ({
              key: String(variable.key ?? ''),
              value: String(variable.value ?? ''),
            })),
          }
        : {}),
      exits: (studio.transitions ?? []).map(eventOf),
      endedExits: ended.filter(isOwn),
      studioSplit: undefined,
    };
    const split: FlowObject = {
      id: splitId,
      type: 'decision',
      ...(object.frameId ? { frameId: object.frameId } : {}),
      text: object.text,
      x: object.x,
      y: object.y + object.height,
      width: object.width,
      height: object.height,
      studioName: splitWidget.name,
      exits: splitExits,
      ...(object.exitOperators && !isRepeat ? { exitOperators: object.exitOperators } : {}),
      endedExits: ended.filter(exit => !isOwn(exit)).map(splitExitOf),
      studio: splitWidget,
    };
    objects.push(first);
    splits.push({ split, first: object.id, after });
    connections = [
      ...connections.map(connection =>
        connection.from === object.id && connection.exit !== undefined && !isOwn(connection.exit)
          ? { ...connection, from: splitId, exit: splitExitOf(connection.exit) }
          : connection,
      ),
      { id: `${splitId}:in`, from: object.id, to: splitId, exit: from },
    ];
    // A failed request that leads to the split live, and still goes where its noMatch goes: through
    // the split again, as live (otherwise straight where the board connects it)
    const targetOf = (fromId: string, exit: string) =>
      connections.find(connection => connection.from === fromId && connection.exit === exit)?.to;
    const noMatchTarget = targetOf(splitId, splitExits[noMatchIndexOf(split)] ?? 'noMatch');
    (studioSplit.alsoFrom ?? []).forEach(exit => {
      if (!ownExits.includes(exit) || ended.includes(exit) || targetOf(object.id, exit) !== noMatchTarget) return;
      connections = [
        ...connections.filter(connection => !(connection.from === object.id && connection.exit === exit)),
        { id: `${splitId}:${exit}`, from: object.id, to: splitId, exit },
      ];
    });
  });
  // Each split where it was in the template (after the widget it followed, or after its check or
  // counter when that widget is gone), so the template only changes where the board did
  // (a split can follow another merged one: placed once that one is)
  const placeOf = (previous: string | undefined, frameId?: string) =>
    previous === ''
      ? 0
      : objects.findIndex(object => object.studio?.name === previous && object.frameId === frameId) + 1;
  let waiting = splits;
  while (waiting.length > 0) {
    const placeable = waiting.filter(
      ({ split, after: previous }) => placeOf(previous, split.frameId) > 0 || previous === '',
    );
    if (placeable.length === 0) break;
    placeable.forEach(({ split, after: previous }) => objects.splice(placeOf(previous, split.frameId), 0, split));
    waiting = waiting.filter(pending => !placeable.includes(pending));
  }
  waiting.forEach(({ split, first }) => objects.splice(objects.findIndex(object => object.id === first) + 1, 0, split));
  return { content: { ...content, objects, connections }, todo };
};
