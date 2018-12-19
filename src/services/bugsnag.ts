import * as React from 'react';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';

const bugsnagClient = bugsnag({
  apiKey: '67e3931dbe1bbf48991ce7d682ceb676',
  notifyReleaseStages: ['production']
});
bugsnagClient.use(bugsnagReact, React);

export default bugsnagClient;
