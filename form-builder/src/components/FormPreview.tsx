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

import { useState } from 'react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { splitIntoColumns } from '../definitions';
import { FieldPreview } from './FieldPreview';

type Props = {
  title: string;
  form: FormItemJsonDefinition[];
  referenceData: Record<string, unknown>;
  splitFormAt?: number;
};

export const FormPreview = ({ title, form, referenceData, splitFormAt }: Props) => {
  const [values, setValues] = useState<Record<string, string>>({});

  if (form.length === 0) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="muted">This form has no fields, so this tab is not shown to counselors.</p>
      </section>
    );
  }

  const renderItem = (item: FormItemJsonDefinition) => (
    <FieldPreview
      key={item.name}
      item={item}
      referenceData={referenceData}
      value={values[item.name] ?? ''}
      dependeeValue={item.type === 'dependent-select' ? values[item.dependsOn] : undefined}
      onChange={(value) => setValues((current) => ({ ...current, [item.name]: value }))}
    />
  );

  const [left, right] = splitIntoColumns(form, splitFormAt);

  return (
    <section className="panel">
      <h2>
        {title} <span className="muted count">{form.length} fields</span>
      </h2>
      <div className="two-columns">
        <div className="column">{left.map(renderItem)}</div>
        <div className="column">{right.map(renderItem)}</div>
      </div>
    </section>
  );
};
