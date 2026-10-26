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
 * A form's fields in Aselo's two-column layout (TwoColumnLayout > ColumnarBlock >
 * ColumnarContent in the plugin): each column takes half the panel, and its fields are
 * 217px wide, starting at the left of that half.
 */
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { splitIntoColumns } from '../definitions';
import { AseloField } from './AseloField';
import type { FieldValue, FormValues } from './aseloFields';
import type { Strings } from './translations';

type Props = {
  form: FormItemJsonDefinition[];
  values: FormValues;
  errors: Record<string, string | undefined>;
  referenceData: Record<string, unknown>;
  strings: Strings;
  splitFormAt?: number;
  onChange: (name: string, value: FieldValue) => void;
};

export const AseloFormBody = ({
  form,
  values,
  errors,
  referenceData,
  strings,
  splitFormAt,
  onChange,
}: Props) => {
  const [left, right] = splitIntoColumns(form, splitFormAt);
  const renderField = (item: FormItemJsonDefinition) => (
    <AseloField
      key={item.name}
      item={item}
      values={values}
      referenceData={referenceData}
      strings={strings}
      error={errors[item.name]}
      onChange={(value) => onChange(item.name, value)}
    />
  );
  return (
    <div className="aselo-two-columns">
      <div className="aselo-columnar-block">
        <div className="aselo-columnar-content">{left.map(renderField)}</div>
      </div>
      <div className="aselo-columnar-block">
        <div className="aselo-columnar-content">{right.map(renderField)}</div>
      </div>
    </div>
  );
};
