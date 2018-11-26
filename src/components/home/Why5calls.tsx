import * as React from 'react';
import lifecycle from 'react-pure-lifecycle';

import * as Constants from '../../common/constants';
import { Link } from 'react-router-dom';
import { Mixpanel } from '../../services/mixpanel';

interface Props {
  totalCount: number;
}

const methods = {
  componentDidMount(props: Props) {
    Mixpanel.track('Home');
  }
};

const Why5calls: React.StatelessComponent<Props> = (props: Props) => (
  <div className="hypothesis">
    <header className="hypothesis__header">
      <h1 className="hypothesis__title">Make your voice heard</h1>
      <h2 className="hypothesis__subtitle">
        <strong>5 Calls</strong> is the easiest and most effective way for
        citizens to make an impact in national and local politics
      </h2>
    </header>
    <div className="hypothesis__text">
      <a href={Constants.contact.apps}>
        <img src="/img/5calls-apps.png" className="hypothesis__text__mobile" />
      </a>
      <p>
        Calling is the most effective way to influence your representative. Read
        more about <Link to="/about">why calling works.</Link>
      </p>
      <div className="subscribe">
        <form
          action="//5calls.us16.list-manage.com/subscribe/post?u=82a164d5fe7f51f4a4efb1f83&amp;id=624ef52208"
          method="post"
          target="popupwindow"
        >
          <label htmlFor="email">
            <strong>Get email alerts once a week</strong>
          </label>
          <span className="emailform">
            <input
              type="text"
              placeholder="youremail@example.com"
              name="email"
              id="email"
            />
            <input type="submit" value="Subscribe" />
          </span>
        </form>
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  </div>
);

export default lifecycle(methods)(Why5calls);
