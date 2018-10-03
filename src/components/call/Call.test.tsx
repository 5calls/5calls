import * as React from 'react';
import { shallow } from 'enzyme';
import { Call } from './index';
import { Issue } from '../../common/model';
import { CallState } from '../../redux/callState';

test('Call component should be rendered if passed a valid object', () => {
  const issue: Issue = Object.assign({}, new Issue(), { id: '1', name: 'testName' });
  let callState: CallState = {
    currentIssueId: 'test1',
    contactIndexes: {'test1': 2, 'test2': 1},
    completedIssueIds: ['test1', 'test2'],
  };
  const component = shallow(
    <Call
      issue={issue}
      callState={callState}
    />);
  expect(component).toMatchSnapshot();
});
