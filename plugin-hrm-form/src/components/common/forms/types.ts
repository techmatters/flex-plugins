/**
 * Copyright (C) 2021-2023 Technology Matters
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

/* eslint-disable import/no-unused-modules */
import type { ObjectType } from '../../../types/types';

export type FormFieldType = { value: string; error?: string; validation?: string[]; touched?: boolean };

export type FormInformation = {
  [key: string]: FormFieldType | FormInformation;
};

// Given a type T that defines a form (where each leaf is of type FormFieldType), infers the structure, with each leaf as the type of FormFieldType['value']
export type FormValues<T> = {
  [P in keyof T]: T[P] extends FormFieldType
    ? FormFieldType['value']
    : T[P] extends FormInformation
    ? FormValues<T[P]>
    : never;
};

export type DefaultEventHandlers = (
  parents: string[],
  name: string,
) => {
  handleBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
};

export type HTMLElementRef = {
  current: HTMLElement;
};

export type FormTargetObject = {
  id: string;
  type: ObjectType;
};
