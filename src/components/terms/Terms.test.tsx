import * as React from 'react';
import { shallow } from 'enzyme';
import { Terms } from './index';

test('Terms component snapshot renders correctly', () => {
  const component = shallow(<Terms />);
  expect(component).toMatchSnapshot();
});
