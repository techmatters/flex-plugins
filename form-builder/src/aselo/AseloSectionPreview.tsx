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
 * A single form (e.g. a case section) in Aselo's look, without the contact tabs.
 */
import { useState } from 'react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from '../definitions';
import { getReferenceData } from '../definitions';
import { AseloFormBody } from './AseloFormBody';
import { FormValues, initialValueFor } from './aseloFields';
import { translate, useStrings } from './translations';
import './aselo.css';

type Props = {
  title: string;
  form: FormItemJsonDefinition[];
  files: DefinitionFileMap;
  helplineLanguage?: string;
  splitFormAt?: number;
};

export const AseloSectionPreview = ({ title, form, files, helplineLanguage, splitFormAt }: Props) => {
  const strings = useStrings(helplineLanguage ?? 'en-US', files);
  const referenceData = getReferenceData(files);
  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(form.map((item) => [item.name, initialValueFor(item, referenceData)])),
  );

  return (
    <div className="aselo-preview">
      <p className="muted">How counselors see this case section in Aselo.</p>
      <div className="aselo" style={{ width: 760 }}>
        <div className="aselo-tab-content">
          <h3 className="aselo-category-title" style={{ margin: '0 0 16px' }}>
            {translate(strings, title)}
          </h3>
          <AseloFormBody
            form={form}
            values={values}
            errors={{}}
            referenceData={referenceData}
            strings={strings}
            splitFormAt={splitFormAt}
            onChange={(name, value) => {
              const next = { ...values, [name]: value };
              form
                .filter((item) => item.type === 'dependent-select' && item.dependsOn === name)
                .forEach((item) => {
                  next[item.name] = initialValueFor(item, referenceData);
                });
              setValues(next);
            }}
          />
        </div>
      </div>
    </div>
  );
};
