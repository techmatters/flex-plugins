import renderer from 'react-test-renderer';

import { formIsValid } from '../states/ValidationRules';
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
