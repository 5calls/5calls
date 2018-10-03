import * as React from 'react';
import { CallState } from '../redux/callState';

const defaultCallState: CallState  = {
  currentIssueId: '',
  contactIndexes: {},
  completedIssueIds: [],
};

export const callStateContext = React.createContext<CallState>(defaultCallState);
