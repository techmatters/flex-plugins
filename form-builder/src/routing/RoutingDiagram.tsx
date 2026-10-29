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
 * A workflow drawn the way the Miro boards did: "New task arrives", then each rule in order
 * ("No match" down to the next one), and for each rule the steps it offers the task to, left to
 * right ("then" when nobody took it). Drawn from the design, so it can't go out of shape; clicking
 * a rule or a step opens its card.
 */
import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FastForward, Hourglass, Inbox, PhoneIncoming, Timer, Users } from 'lucide-react';
import type { Condition, MoveOn, RoutingDesign, Workflow } from './model';
import { describeMoveOn, describeOrderBy, describeWho, queueName, targetSkills } from './describe';
import { ConditionChip, FamilyLegend } from './ConditionChip';

type RuleData = {
  index: number;
  name: string;
  when: Condition[][];
  queueName: (key: string) => string;
  selected: boolean;
};
type TargetData = {
  step: number;
  queue: string;
  who: string;
  skills: string[];
  prefer?: string;
  priority?: number;
  moveOn: MoveOn;
  last: boolean;
  selected: boolean;
};

const RULE_WIDTH = 300;
const TARGET_WIDTH = 250;
const MIN_ROW_HEIGHT = 190;
const COLUMN_GAP = 60;

// Roughly how tall a rule's node is: its chips wrap about two to a line
const ruleHeight = (when: Condition[][]) =>
  70 +
  when.reduce((total, group) => total + Math.max(1, Math.ceil(group.length / 2)) * 26, 0) +
  Math.max(0, when.length - 1) * 22;

const MOVE_ON_ICONS = { skip: FastForward, timeout: Timer, wait: Hourglass } as const;

const StartNode = () => (
  <div className="routing-node routing-start">
    <PhoneIncoming size={16} aria-hidden /> New task arrives
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const RuleNode = ({ data }: NodeProps<Node<RuleData>>) => {
  const everyTask = data.when.length === 0 || data.when.some((group) => group.length === 0);
  return (
    <div className={`routing-node routing-rule ${data.selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <span className="routing-node-title">
        <span className="routing-rule-number">{data.index + 1}</span>
        <strong>{data.name || 'Unnamed rule'}</strong>
      </span>
      {everyTask ? (
        <span className="routing-node-hint">Every task</span>
      ) : (
        data.when.map((group, groupIndex) => (
          <div key={groupIndex} className="routing-node-group">
            {groupIndex > 0 && <span className="routing-node-or">or</span>}
            <span className="routing-node-chips">
              {group.map((condition, index) => (
                <ConditionChip key={index} condition={condition} queueName={data.queueName} />
              ))}
            </span>
          </div>
        ))
      )}
      <Handle type="source" position={Position.Bottom} id="next" />
      <Handle type="source" position={Position.Right} id="match" />
    </div>
  );
};

const TargetNode = ({ data }: NodeProps<Node<TargetData>>) => {
  const MoveOnIcon = MOVE_ON_ICONS[data.moveOn.kind];
  return (
    <div className={`routing-node routing-target ${data.selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <span className="routing-target-queue">
        <Inbox size={14} aria-hidden /> {data.queue}
        {data.priority !== undefined && (
          <span className="routing-priority" title="Priority">
            P{data.priority}
          </span>
        )}
      </span>
      <span className="routing-node-who">
        <Users size={12} aria-hidden /> {data.who.replace(/ with .*$/, '')}
      </span>
      {data.skills.length > 0 && (
        <span className="routing-node-chips">
          {data.skills.map((skill) => (
            <span key={skill} className="routing-chip skill">
              {skill}
            </span>
          ))}
        </span>
      )}
      {data.prefer && <span className="routing-node-hint">{data.prefer}</span>}
      <span className={`routing-node-move ${data.moveOn.kind}`}>
        <MoveOnIcon size={12} aria-hidden />{' '}
        {data.last && data.moveOn.kind !== 'wait'
          ? 'If nobody takes it, it leaves the rule'
          : describeMoveOn(data.moveOn)}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const NODE_TYPES = { start: StartNode, rule: RuleNode, target: TargetNode };

const arrow = { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#546e7a' };

type Props = {
  design: RoutingDesign;
  workflow: Workflow;
  selectedRuleId?: string;
  onSelectRule: (ruleId: string) => void;
};

const Diagram = ({ design, workflow, selectedRuleId, onSelectRule }: Props) => {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [{ id: 'start', type: 'start', position: { x: 40, y: 0 }, data: {}, draggable: false }];
    const edges: Edge[] = [];
    const nameOfQueue = (key: string) => queueName(design, key);
    let y = 90;
    workflow.rules.forEach((rule, index) => {
      const ruleY = y;
      y += Math.max(MIN_ROW_HEIGHT, ruleHeight(rule.when) + 50);
      nodes.push({
        id: rule.id,
        type: 'rule',
        position: { x: 0, y: ruleY },
        data: {
          index,
          name: rule.name,
          when: rule.when,
          queueName: nameOfQueue,
          selected: rule.id === selectedRuleId,
        },
        draggable: false,
      });
      edges.push({
        id: `in-${rule.id}`,
        source: index === 0 ? 'start' : workflow.rules[index - 1].id,
        sourceHandle: index === 0 ? undefined : 'next',
        target: rule.id,
        label: index === 0 ? undefined : 'No match',
        markerEnd: arrow,
        type: 'smoothstep',
      });
      rule.targets.forEach((target, step) => {
        nodes.push({
          id: target.id,
          type: 'target',
          position: { x: RULE_WIDTH + COLUMN_GAP + step * (TARGET_WIDTH + COLUMN_GAP), y: ruleY },
          data: {
            step,
            queue: queueName(design, target.queue),
            who: target.knownWorker ? 'The counselor it was transferred to' : describeWho(target.who),
            skills: target.knownWorker ? [] : targetSkills(target),
            prefer: describeOrderBy(target.orderBy),
            priority: target.priority,
            moveOn: target.moveOn,
            last: step === rule.targets.length - 1,
            selected: rule.id === selectedRuleId,
          },
          draggable: false,
        });
        edges.push({
          id: `to-${target.id}`,
          source: step === 0 ? rule.id : rule.targets[step - 1].id,
          sourceHandle: step === 0 ? 'match' : undefined,
          target: target.id,
          label: step === 0 ? 'match' : 'then',
          markerEnd: arrow,
          type: 'smoothstep',
        });
      });
    });
    return { nodes, edges };
  }, [design, workflow, selectedRuleId]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable={false}
      fitView
      fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
      minZoom={0.1}
      onNodeClick={(_, node) => {
        const rule = workflow.rules.find(
          (candidate) => candidate.id === node.id || candidate.targets.some((target) => target.id === node.id),
        );
        if (rule) onSelectRule(rule.id);
      }}
    >
      <Panel position="top-right">
        <FamilyLegend />
      </Panel>
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

export const RoutingDiagram = (props: Props) => (
  <ReactFlowProvider>
    <Diagram {...props} />
  </ReactFlowProvider>
);
