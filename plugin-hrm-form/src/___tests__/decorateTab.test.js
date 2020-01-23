jest.mock('@material-ui/core', () => {
  return {
    Tab: 'Tab'
  };
});
jest.mock('../states/ValidationRules', () => {
  return {
    formIsValid: jest.fn()
  };
});
jest.mock('@material-ui/icons/Error', () => 'ErrorIcon');
import decorateTab from '../components/decorateTab';
import { Tab } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import { formIsValid } from '../states/ValidationRules';
import renderer from 'react-test-renderer';

test('decorateTab when valid', () => {
  formIsValid.mockReturnValueOnce(true);
  const component = renderer.create(
    decorateTab("My Label", {})
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('decorateTab when invalid', () => {
  formIsValid.mockReturnValueOnce(false);
  const component = renderer.create(
    decorateTab("My Label", {})
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});