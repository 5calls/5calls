import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Why5calls, HomeExtras } from './index';
import { Layout } from '../layout';
import { remoteStateContext } from '../../contexts/RemoteStateContext';

interface Props extends RouteComponentProps<{ id: string }> {}

/*
  This is a StatelessComponent meaning that it is just a function. The props are passed in as
  a property.  More complicated components will be instantiated as a class and will often
  have "local" state.  Props for them will be an instance property.

  Notice that we are just passing all of the props that we pull off the Redux Store through
  this component to child components
*/
export const HomePage: React.StatelessComponent<Props> = (props: Props) => (
  <remoteStateContext.Consumer>
    {state => (
      <Layout extraComponent={<HomeExtras />}>
        <Why5calls totalCount={state.callTotal} />
      </Layout>
    )}
  </remoteStateContext.Consumer>
);

export default HomePage;
