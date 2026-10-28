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
 * The board's tasks: sticky notes made into tasks, with who they're for and how far along they
 * are. Done tasks stay, greyed out, so the board keeps a record of what was decided.
 */
import { useState } from 'react';
import { Square, SquareCheck } from 'lucide-react';
import type { CanvasNode, StickyNode } from './canvasModel';
import { TASK_STATUSES, TaskStatus } from './model';

type Filter = 'open' | 'mine' | 'all';

type Props = {
  nodes: CanvasNode[];
  readOnly: boolean;
  userName: string;
  userEmail?: string;
  onNodeData: (id: string, data: CanvasNode['data']) => void;
  onShow: (id: string) => void;
};

export const taskNodes = (nodes: CanvasNode[]) =>
  nodes.filter((node): node is StickyNode => node.type === 'sticky' && Boolean(node.data.sticky.task));

export const openTaskCount = (nodes: CanvasNode[]) =>
  taskNodes(nodes).filter((node) => node.data.sticky.task?.status !== 'done').length;

const firstLine = (text: string) => text.split('\n').find((line) => line.trim()) ?? 'Untitled task';

const ORDER: Record<TaskStatus, number> = { doing: 0, todo: 1, done: 2 };

export const TasksPanel = ({ nodes, readOnly, userName, userEmail, onNodeData, onShow }: Props) => {
  const [filter, setFilter] = useState<Filter>('open');
  const tasks = taskNodes(nodes)
    .filter(({ data: { sticky } }) => {
      if (filter === 'open') return sticky.task?.status !== 'done';
      if (filter === 'mine') {
        const email = sticky.task?.assigneeEmail;
        return email && userEmail
          ? email.toLowerCase() === userEmail.toLowerCase()
          : sticky.task?.assignee === userName;
      }
      return true;
    })
    .sort((a, b) => ORDER[a.data.sticky.task!.status] - ORDER[b.data.sticky.task!.status]);

  const setStatus = (node: StickyNode, status: TaskStatus) =>
    onNodeData(node.id, { sticky: { ...node.data.sticky, task: { ...node.data.sticky.task!, status } } });

  return (
    <div className="flow-tasks" role="region" aria-label="Tasks">
      <div className="flow-tasks-filter" role="group" aria-label="Show">
        {(
          [
            ['open', 'Open'],
            ['mine', 'Mine'],
            ['all', 'All'],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? 'active' : ''}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {tasks.length === 0 && (
        <p className="field-hint">
          {filter === 'open' ? 'No open tasks. ' : 'No tasks here. '}
          To add one, select a sticky note and choose “Make it a task”.
        </p>
      )}
      <ul className="flow-task-list">
        {tasks.map((node) => {
          const { sticky } = node.data;
          const task = sticky.task!;
          const done = task.status === 'done';
          return (
            <li key={node.id} className={`flow-task ${task.status}`}>
              <button
                type="button"
                className="flow-task-check"
                aria-label={done ? 'Mark as not done' : 'Mark as done'}
                disabled={readOnly}
                onClick={() => setStatus(node, done ? 'todo' : 'done')}
              >
                {done ? <SquareCheck size={18} /> : <Square size={18} />}
              </button>
              <div className="flow-task-body">
                <button type="button" className="link-button flow-task-title" onClick={() => onShow(node.id)}>
                  {firstLine(sticky.text)}
                </button>
                <span className="field-hint">
                  {[
                    TASK_STATUSES[task.status],
                    task.assignee ? `for ${task.assignee}` : 'not assigned',
                    task.due ? `due ${task.due}` : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
