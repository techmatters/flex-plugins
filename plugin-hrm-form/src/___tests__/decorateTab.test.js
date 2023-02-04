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

import renderer from 'react-test-renderer';

import { formIsValid } from '../states/validationRules';
import decorateTab from '../components/decorateTab';

jest.mock('../styles/HrmStyles', () => ({ StyledTab: 'StyledTab' }));
jest.mock('../states/ValidationRules', () => ({ formIsValid: jest.fn() }));
jest.mock('@material-ui/icons/Error', () => 'ErrorIcon');

test('decorateTab when valid', () => {
  formIsValid.mockReturnValueOnce(true);
  const component = renderer.create(decorateTab('My Label', {}));
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('decorateTab when invalid', () => {
  formIsValid.mockReturnValueOnce(false);
  const component = renderer.create(decorateTab('My Label', {}));
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
