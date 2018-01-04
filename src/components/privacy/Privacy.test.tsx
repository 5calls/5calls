import * as React from 'react';
import { shallow } from 'enzyme';
import { Privacy } from './index';

test('Privacy component snapshot renders correctly', () => {
  const component = shallow(<Privacy />);
  expect(component).toMatchSnapshot();
});
