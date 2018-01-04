import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { Terms } from './index';
import { LayoutContainer } from '../layout';

interface Props extends RouteComponentProps<{ id: string }> { }

const TermsPage: React.StatelessComponent<Props> = (props: Props) => (
  <LayoutContainer>
    <Terms />
  </LayoutContainer>
);

export default withRouter(TermsPage);
