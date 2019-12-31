import * as React from 'react';
import i18n from '../../services/i18n';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';

const Navigation: React.StatelessComponent = () => {
  return (
    <div className="layout">
      <div className="colophon">
        <ul className="colophon__left">
          <li>
            <Link to="/about">
              <i aria-hidden="true" className="fa fa-heart" />
              <span>{i18n.t('footer.about')}</span>
            </Link>
          </li>
          <li>
            <Link to="/faq">
              <i aria-hidden="true" className="fa fa-question-circle" />
              <span>{i18n.t('footer.faq')}</span>
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/5calls/5calls"
              target="_blank"
              rel="noopener"
            >
              <i aria-hidden="true" className="fab fa-github" />
              <span>{i18n.t('footer.openSource')}</span>
            </a>
          </li>
          <li>
            <a href="/privacy" data-no-routing="data-no-routing">
              <i aria-hidden="true" className="fas fa-shield-alt" />
              <span>{i18n.t('footer.privacy')}</span>
            </a>
          </li>
        </ul>
        <ul className="colophon__right">
          <li>
            <Link id="impact__link" to="/impact">
              <i aria-hidden="true" className="fas fa-chart-line" />
              <span>Your Impact</span>
            </Link>
          </li>
          <li>
            <a href="/archives/">
              <i aria-hidden="true" className="fas fa-archive" />
              <span>Topic Archive</span>
            </a>
          </li>
          <li>
            <a href="https://secure.actblue.com/contribute/page/5calls?refcode=web">
              <i aria-hidden="true" className="fas fa-comment-dollar" />
              <span>Be a Supporter</span>
            </a>
          </li>
        </ul>
        <div className="colophon__center">
          <p>
            © 2019 <i aria-hidden="true" className="fas fa-star" /> 5 Calls
            Civic Action is a 501(c)4 non-profit that helps citizens make their
            voices heard.
          </p>
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    </div>
  );
};

export default translate()(Navigation);
