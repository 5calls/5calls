import * as React from 'react';
import { Link } from 'react-router-dom';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';

interface Props {
  readonly t: TranslationFunction;
}

const Navigation: React.StatelessComponent<Props> = (props: Props) => {
  return (
    <div className="layout">
    <div className="colophon">
      <ul className="colophon__left">
        <li>
          <Link to="/about"><i aria-hidden="true" className="fa fa-heart" />
            <span>{props.t('footer.about')}</span>
          </Link>
        </li>
        <li>
          <Link to="/faq"><i aria-hidden="true" className="fa fa-question-circle" />
            <span>{props.t('footer.faq')}</span>
          </Link>
        </li>
        <li>
          <a href="https://github.com/5calls/5calls" target="_blank"><i aria-hidden="true" className="fa fa-github" />
            <span>{props.t('footer.openSource')}</span>
          </a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="/privacy" data-no-routing="data-no-routing"><i aria-hidden="true" className="fa fa-shield" />
            <span>{props.t('footer.privacy')}</span>
          </a>
        </li>
      </ul>
      <ul className="colophon__right">
        <li>
          <Link id="impact__link" to="/impact"><i aria-hidden="true" className="fa fa-line-chart" />
            <span>Your Impact</span>
          </Link>
        </li>
        <li>
          <a href="https://secure.actblue.com/contribute/page/5calls?refcode=web">
            <i aria-hidden="true" className="fa fa-money" />
            <span>Be a Supporter</span>
          </a>
        </li>
      </ul>
      <div className="colophon__center">
        <p>© 2018 5 Calls Civic Action is a 501(c)4 non-profit that helps citizens make their voices heard.</p>
        <p><a href="http://ipinfo.io" target="_blank">{props.t('footer.ipGeolocation')}</a></p>
      </div>
      <div style={{'clear': 'both'}} />
    </div>
    </div>
  );
};

export default translate()(Navigation);
