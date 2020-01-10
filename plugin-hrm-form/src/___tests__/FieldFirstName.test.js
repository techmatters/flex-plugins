import React from 'react';
import FieldFirstName from '../components/FieldFirstName';
import renderer from 'react-test-renderer';

test('FieldFirstName renders as planned', () => {
  const component = renderer.create(
    <FieldFirstName />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
